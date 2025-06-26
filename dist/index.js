var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  attendanceLog: () => attendanceLog,
  attendanceLogRelations: () => attendanceLogRelations,
  faculties: () => faculties,
  facultiesRelations: () => facultiesRelations,
  insertAttendanceLogSchema: () => insertAttendanceLogSchema,
  insertFacultySchema: () => insertFacultySchema,
  insertPointsSchema: () => insertPointsSchema,
  insertRedemptionSchema: () => insertRedemptionSchema,
  insertRewardSchema: () => insertRewardSchema,
  insertStudentSchema: () => insertStudentSchema,
  insertUserSchema: () => insertUserSchema,
  points: () => points,
  pointsPolicy: () => pointsPolicy,
  pointsRelations: () => pointsRelations,
  redemptions: () => redemptions,
  redemptionsRelations: () => redemptionsRelations,
  rewards: () => rewards,
  rewardsRelations: () => rewardsRelations,
  sessions: () => sessions,
  students: () => students,
  studentsRelations: () => studentsRelations,
  users: () => users,
  usersRelations: () => usersRelations
});
import { pgTable, text, serial, integer, boolean, timestamp, varchar, jsonb, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
var sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull()
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  // 'student', 'faculty', 'admin'
  department: text("department"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var students = pgTable("students", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  rollNumber: text("roll_number").unique().notNull(),
  batch: text("batch").notNull(),
  totalPoints: integer("total_points").default(0),
  academicPoints: integer("academic_points").default(0),
  attendancePoints: integer("attendance_points").default(0),
  activityPoints: integer("activity_points").default(0),
  redemptionHistory: jsonb("redemption_history").default([])
});
var faculties = pgTable("faculties", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  employeeId: text("employee_id").unique().notNull(),
  designation: text("designation")
});
var points = pgTable("points", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => students.id).notNull(),
  category: text("category").notNull(),
  // 'academic', 'attendance', 'volunteering', 'cultural', 'sports'
  points: integer("points").notNull(),
  description: text("description").notNull(),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  proofUrl: text("proof_url"),
  createdAt: timestamp("created_at").defaultNow()
});
var attendanceLog = pgTable("attendance_log", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => students.id).notNull(),
  date: timestamp("date").notNull(),
  classesAttended: integer("classes_attended").notNull(),
  totalClasses: integer("total_classes").notNull(),
  approved: boolean("approved").default(true),
  approvedBy: integer("approved_by").references(() => users.id),
  reason: text("reason")
  // for missed classes
});
var rewards = pgTable("rewards", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  pointCost: integer("point_cost").notNull(),
  availableQuantity: integer("available_quantity").notNull(),
  category: text("category"),
  // 'food', 'books', 'merchandise', 'events'
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow()
});
var redemptions = pgTable("redemptions", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => students.id).notNull(),
  rewardId: integer("reward_id").references(() => rewards.id).notNull(),
  dateRedeemed: timestamp("date_redeemed").defaultNow(),
  status: text("status").default("pending"),
  // 'pending', 'completed', 'cancelled'
  pointsUsed: integer("points_used").notNull()
});
var pointsPolicy = pgTable("points_policy", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  maxPointsPerSemester: integer("max_points_per_semester").notNull(),
  pointsPerActivity: integer("points_per_activity").notNull(),
  description: text("description")
});
var usersRelations = relations(users, ({ one, many }) => ({
  student: one(students, {
    fields: [users.id],
    references: [students.userId]
  }),
  faculty: one(faculties, {
    fields: [users.id],
    references: [faculties.userId]
  }),
  pointsAssigned: many(points, { relationName: "assignedBy" }),
  attendanceApprovals: many(attendanceLog, { relationName: "approvedBy" })
}));
var studentsRelations = relations(students, ({ one, many }) => ({
  user: one(users, {
    fields: [students.userId],
    references: [users.id]
  }),
  points: many(points),
  attendanceLog: many(attendanceLog),
  redemptions: many(redemptions)
}));
var facultiesRelations = relations(faculties, ({ one }) => ({
  user: one(users, {
    fields: [faculties.userId],
    references: [users.id]
  })
}));
var pointsRelations = relations(points, ({ one }) => ({
  student: one(students, {
    fields: [points.studentId],
    references: [students.id]
  }),
  createdBy: one(users, {
    fields: [points.createdBy],
    references: [users.id],
    relationName: "assignedBy"
  })
}));
var attendanceLogRelations = relations(attendanceLog, ({ one }) => ({
  student: one(students, {
    fields: [attendanceLog.studentId],
    references: [students.id]
  }),
  approvedBy: one(users, {
    fields: [attendanceLog.approvedBy],
    references: [users.id],
    relationName: "approvedBy"
  })
}));
var redemptionsRelations = relations(redemptions, ({ one }) => ({
  student: one(students, {
    fields: [redemptions.studentId],
    references: [students.id]
  }),
  reward: one(rewards, {
    fields: [redemptions.rewardId],
    references: [rewards.id]
  })
}));
var rewardsRelations = relations(rewards, ({ many }) => ({
  redemptions: many(redemptions)
}));
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertStudentSchema = createInsertSchema(students).omit({
  id: true,
  totalPoints: true,
  academicPoints: true,
  attendancePoints: true,
  activityPoints: true,
  redemptionHistory: true
});
var insertFacultySchema = createInsertSchema(faculties).omit({
  id: true
});
var insertPointsSchema = createInsertSchema(points).omit({
  id: true,
  createdAt: true
});
var insertRewardSchema = createInsertSchema(rewards).omit({
  id: true,
  createdAt: true
});
var insertRedemptionSchema = createInsertSchema(redemptions).omit({
  id: true,
  dateRedeemed: true
});
var insertAttendanceLogSchema = createInsertSchema(attendanceLog).omit({
  id: true
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq, desc, and, sql, count } from "drizzle-orm";
import bcrypt from "bcrypt";
var DatabaseStorage = class {
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async getUserByEmail(email) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
  async createUser(userData) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const [user] = await db.insert(users).values({ ...userData, password: hashedPassword }).returning();
    return user;
  }
  async getStudent(userId) {
    const [student] = await db.select().from(students).where(eq(students.userId, userId));
    return student;
  }
  async getStudentByRollNumber(rollNumber) {
    const [student] = await db.select().from(students).where(eq(students.rollNumber, rollNumber));
    return student;
  }
  async createStudent(studentData) {
    const [student] = await db.insert(students).values(studentData).returning();
    return student;
  }
  async updateStudentPoints(studentId, pointsData) {
    await db.update(students).set(pointsData).where(eq(students.id, studentId));
  }
  async getAllStudents() {
    const result = await db.select().from(students).innerJoin(users, eq(students.userId, users.id)).orderBy(desc(students.totalPoints));
    return result.map((row) => ({
      ...row.students,
      user: row.users
    }));
  }
  async getTopStudents(limit) {
    const result = await db.select().from(students).innerJoin(users, eq(students.userId, users.id)).orderBy(desc(students.totalPoints)).limit(limit);
    return result.map((row) => ({
      ...row.students,
      user: row.users
    }));
  }
  async getFaculty(userId) {
    const [faculty] = await db.select().from(faculties).where(eq(faculties.userId, userId));
    return faculty;
  }
  async createFaculty(facultyData) {
    const [faculty] = await db.insert(faculties).values(facultyData).returning();
    return faculty;
  }
  async getAllFaculty() {
    const result = await db.select().from(faculties).innerJoin(users, eq(faculties.userId, users.id));
    return result.map((row) => ({
      ...row.faculties,
      user: row.users
    }));
  }
  async createPoints(pointsData) {
    const [pointsRecord] = await db.insert(points).values(pointsData).returning();
    const student = await db.select().from(students).where(eq(students.id, pointsData.studentId));
    if (student[0]) {
      const currentStudent = student[0];
      const updates = {};
      switch (pointsData.category) {
        case "academic":
          updates.academicPoints = (currentStudent.academicPoints || 0) + pointsData.points;
          break;
        case "attendance":
          updates.attendancePoints = (currentStudent.attendancePoints || 0) + pointsData.points;
          break;
        case "volunteering":
        case "cultural":
        case "sports":
          updates.activityPoints = (currentStudent.activityPoints || 0) + pointsData.points;
          break;
      }
      updates.totalPoints = (currentStudent.totalPoints || 0) + pointsData.points;
      await this.updateStudentPoints(pointsData.studentId, updates);
    }
    return pointsRecord;
  }
  async getPointsByStudent(studentId) {
    return await db.select().from(points).where(eq(points.studentId, studentId)).orderBy(desc(points.createdAt));
  }
  async getPointsAssignedByFaculty(facultyId) {
    const result = await db.select().from(points).innerJoin(students, eq(points.studentId, students.id)).innerJoin(users, eq(students.userId, users.id)).where(eq(points.createdBy, facultyId)).orderBy(desc(points.createdAt));
    return result.map((row) => ({
      ...row.points,
      student: {
        ...row.students,
        user: row.users
      }
    }));
  }
  async getAllPointsWithDetails() {
    const result = await db.select().from(points).innerJoin(students, eq(points.studentId, students.id)).innerJoin(users, eq(students.userId, users.id)).orderBy(desc(points.createdAt));
    const pointsWithCreators = await Promise.all(
      result.map(async (row) => {
        const creator = await this.getUser(row.points.createdBy);
        const pointsRecord = {
          ...row.points,
          student: {
            ...row.students,
            user: row.users
          },
          createdBy: creator || { id: 0, email: "", name: "Unknown", role: "", department: "", password: "", createdAt: null, updatedAt: null }
        };
        return pointsRecord;
      })
    );
    return pointsWithCreators;
  }
  async createAttendanceLog(attendanceData) {
    const [attendance] = await db.insert(attendanceLog).values(attendanceData).returning();
    return attendance;
  }
  async getPendingAttendanceApprovals() {
    const result = await db.select().from(attendanceLog).innerJoin(students, eq(attendanceLog.studentId, students.id)).innerJoin(users, eq(students.userId, users.id)).where(eq(attendanceLog.approved, false)).orderBy(desc(attendanceLog.date));
    return result.map((row) => ({
      ...row.attendance_log,
      student: {
        ...row.students,
        user: row.users
      }
    }));
  }
  async updateAttendanceApproval(id, approved, approvedBy) {
    await db.update(attendanceLog).set({ approved, approvedBy }).where(eq(attendanceLog.id, id));
  }
  async getAllRewards() {
    return await db.select().from(rewards).orderBy(rewards.name);
  }
  async getActiveRewards() {
    return await db.select().from(rewards).where(and(eq(rewards.isActive, true), sql`${rewards.availableQuantity} > 0`)).orderBy(rewards.pointCost);
  }
  async createReward(rewardData) {
    const [reward] = await db.insert(rewards).values(rewardData).returning();
    return reward;
  }
  async updateReward(id, rewardData) {
    await db.update(rewards).set(rewardData).where(eq(rewards.id, id));
  }
  async deleteReward(id) {
    await db.update(rewards).set({ isActive: false }).where(eq(rewards.id, id));
  }
  async createRedemption(redemptionData) {
    const [redemption] = await db.insert(redemptions).values(redemptionData).returning();
    await db.update(rewards).set({ availableQuantity: sql`${rewards.availableQuantity} - 1` }).where(eq(rewards.id, redemptionData.rewardId));
    await db.update(students).set({ totalPoints: sql`${students.totalPoints} - ${redemptionData.pointsUsed}` }).where(eq(students.id, redemptionData.studentId));
    return redemption;
  }
  async getRedemptionsByStudent(studentId) {
    const result = await db.select().from(redemptions).innerJoin(rewards, eq(redemptions.rewardId, rewards.id)).where(eq(redemptions.studentId, studentId)).orderBy(desc(redemptions.dateRedeemed));
    return result.map((row) => ({
      ...row.redemptions,
      reward: row.rewards
    }));
  }
  async getAllRedemptions() {
    const result = await db.select().from(redemptions).innerJoin(students, eq(redemptions.studentId, students.id)).innerJoin(users, eq(students.userId, users.id)).innerJoin(rewards, eq(redemptions.rewardId, rewards.id)).orderBy(desc(redemptions.dateRedeemed));
    return result.map((row) => ({
      ...row.redemptions,
      student: {
        ...row.students,
        user: row.users
      },
      reward: row.rewards
    }));
  }
  async updateRedemptionStatus(id, status) {
    await db.update(redemptions).set({ status }).where(eq(redemptions.id, id));
  }
  async getTotalPointsAwarded() {
    const result = await db.select({ total: sql`sum(${points.points})` }).from(points);
    return result[0]?.total || 0;
  }
  async getActiveStudentsCount() {
    const result = await db.select({ count: count() }).from(students);
    return result[0]?.count || 0;
  }
  async getMonthlyRedemptionsCount() {
    const result = await db.select({ count: count() }).from(redemptions).where(sql`date_trunc('month', ${redemptions.dateRedeemed}) = date_trunc('month', current_date)`);
    return result[0]?.count || 0;
  }
  async getFacultyCount() {
    const result = await db.select({ count: count() }).from(faculties);
    return result[0]?.count || 0;
  }
  async getDepartmentStats() {
    const result = await db.select({
      department: users.department,
      studentCount: count(students.id),
      avgPoints: sql`avg(${students.totalPoints})`
    }).from(users).innerJoin(students, eq(users.id, students.userId)).where(eq(users.role, "student")).groupBy(users.department);
    return result;
  }
  async seedDatabase() {
    const existingUsers = await db.select().from(users).limit(1);
    if (existingUsers.length > 0) {
      return;
    }
    const admin1 = await this.createUser({
      email: "admin1@college.edu",
      password: "password123",
      name: "Dr. Rajesh Kumar",
      role: "admin",
      department: "Administration"
    });
    const admin2 = await this.createUser({
      email: "admin2@college.edu",
      password: "password123",
      name: "Prof. Priya Sharma",
      role: "admin",
      department: "Administration"
    });
    const faculty1 = await this.createUser({
      email: "faculty1@college.edu",
      password: "password123",
      name: "Dr. Amit Singh",
      role: "faculty",
      department: "Computer Science"
    });
    const faculty2 = await this.createUser({
      email: "faculty2@college.edu",
      password: "password123",
      name: "Prof. Sunita Rao",
      role: "faculty",
      department: "Electronics"
    });
    const faculty3 = await this.createUser({
      email: "faculty3@college.edu",
      password: "password123",
      name: "Dr. Vikram Patel",
      role: "faculty",
      department: "Mechanical"
    });
    const facultyRecord1 = await this.createFaculty({
      userId: faculty1.id,
      employeeId: "FAC001",
      designation: "Associate Professor"
    });
    const facultyRecord2 = await this.createFaculty({
      userId: faculty2.id,
      employeeId: "FAC002",
      designation: "Assistant Professor"
    });
    const facultyRecord3 = await this.createFaculty({
      userId: faculty3.id,
      employeeId: "FAC003",
      designation: "Professor"
    });
    const studentData = [
      { name: "John Doe", department: "Computer Science", rollNumber: "CS2021001", batch: "2021-2025" },
      { name: "Jane Smith", department: "Electronics", rollNumber: "EC2021002", batch: "2021-2025" },
      { name: "Mike Johnson", department: "Mechanical", rollNumber: "ME2021003", batch: "2021-2025" },
      { name: "Sarah Wilson", department: "Computer Science", rollNumber: "CS2021004", batch: "2021-2025" },
      { name: "David Brown", department: "Electronics", rollNumber: "EC2021005", batch: "2021-2025" },
      { name: "Lisa Davis", department: "Mechanical", rollNumber: "ME2021006", batch: "2021-2025" },
      { name: "Chris Miller", department: "Computer Science", rollNumber: "CS2021007", batch: "2021-2025" },
      { name: "Anna Garcia", department: "Electronics", rollNumber: "EC2021008", batch: "2021-2025" },
      { name: "Tom Anderson", department: "Mechanical", rollNumber: "ME2021009", batch: "2021-2025" },
      { name: "Emma White", department: "Computer Science", rollNumber: "CS2021010", batch: "2021-2025" }
    ];
    const studentRecords = [];
    for (const student of studentData) {
      const user = await this.createUser({
        email: `${student.rollNumber.toLowerCase()}@student.college.edu`,
        password: "password123",
        name: student.name,
        role: "student",
        department: student.department
      });
      const studentRecord = await this.createStudent({
        userId: user.id,
        rollNumber: student.rollNumber,
        batch: student.batch
      });
      studentRecords.push(studentRecord);
    }
    const rewardsData = [
      {
        name: "Canteen Coffee Voucher",
        description: "Free coffee at campus canteen",
        imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=200&fit=crop",
        pointCost: 50,
        availableQuantity: 50,
        category: "food"
      },
      {
        name: "Bookstore Discount",
        description: "20% off on any book purchase",
        imageUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=200&fit=crop",
        pointCost: 100,
        availableQuantity: 30,
        category: "books"
      },
      {
        name: "College T-Shirt",
        description: "Official college merchandise",
        imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=200&fit=crop",
        pointCost: 200,
        availableQuantity: 25,
        category: "merchandise"
      },
      {
        name: "Cultural Event Pass",
        description: "Free entry to cultural events",
        imageUrl: "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?w=300&h=200&fit=crop",
        pointCost: 75,
        availableQuantity: 40,
        category: "events"
      }
    ];
    for (const reward of rewardsData) {
      await this.createReward(reward);
    }
    const pointsCategories = ["academic", "attendance", "volunteering", "cultural", "sports"];
    for (let i = 0; i < studentRecords.length; i++) {
      const student = studentRecords[i];
      const pointsCount = Math.floor(Math.random() * 10) + 5;
      for (let j = 0; j < pointsCount; j++) {
        const category = pointsCategories[Math.floor(Math.random() * pointsCategories.length)];
        const pointsValue = Math.floor(Math.random() * 30) + 5;
        const facultyId = [faculty1.id, faculty2.id, faculty3.id][Math.floor(Math.random() * 3)];
        await this.createPoints({
          studentId: student.id,
          category,
          points: pointsValue,
          description: `${category.charAt(0).toUpperCase() + category.slice(1)} achievement`,
          createdBy: facultyId
        });
      }
    }
    for (const student of studentRecords) {
      const logsCount = Math.floor(Math.random() * 5) + 3;
      for (let j = 0; j < logsCount; j++) {
        const totalClasses = 6;
        const classesAttended = Math.floor(Math.random() * 7);
        const approved = classesAttended >= 6 ? true : Math.random() > 0.3;
        await this.createAttendanceLog({
          studentId: student.id,
          date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1e3),
          // Random date in last 30 days
          classesAttended,
          totalClasses,
          approved,
          approvedBy: approved ? [faculty1.id, faculty2.id, faculty3.id][Math.floor(Math.random() * 3)] : null,
          reason: classesAttended < 6 ? "Medical reason" : null
        });
      }
    }
    for (let i = 0; i < 5; i++) {
      const student = studentRecords[Math.floor(Math.random() * studentRecords.length)];
      const rewardId = Math.floor(Math.random() * 4) + 1;
      const pointsUsed = [50, 100, 200, 75][rewardId - 1];
      await this.createRedemption({
        studentId: student.id,
        rewardId,
        pointsUsed,
        status: "completed"
      });
    }
    const policiesData = [
      { category: "academic", maxPointsPerSemester: 500, pointsPerActivity: 25, description: "Academic achievements and excellence" },
      { category: "attendance", maxPointsPerSemester: 300, pointsPerActivity: 10, description: "Regular class attendance" },
      { category: "volunteering", maxPointsPerSemester: 200, pointsPerActivity: 15, description: "Community service and volunteering" },
      { category: "cultural", maxPointsPerSemester: 150, pointsPerActivity: 20, description: "Cultural events and activities" },
      { category: "sports", maxPointsPerSemester: 150, pointsPerActivity: 20, description: "Sports participation and achievements" }
    ];
    for (const policy of policiesData) {
      await db.insert(pointsPolicy).values(policy);
    }
  }
};
var storage = new DatabaseStorage();

// server/routes.ts
import bcrypt2 from "bcrypt";
import session from "express-session";
async function registerRoutes(app2) {
  app2.use(session({
    secret: process.env.SESSION_SECRET || "meritMint-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      // Set to true in production with HTTPS
      maxAge: 24 * 60 * 60 * 1e3
      // 24 hours
    }
  }));
  const requireAuth = (req, res, next) => {
    if (!req.session.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };
  const requireRole = (...roles) => {
    return (req, res, next) => {
      if (!req.session.user || !roles.includes(req.session.user.role)) {
        return res.status(403).json({ message: "Forbidden" });
      }
      next();
    };
  };
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const validPassword = await bcrypt2.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      req.session.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department
      };
      let roleData = null;
      if (user.role === "student") {
        roleData = await storage.getStudent(user.id);
      } else if (user.role === "faculty") {
        roleData = await storage.getFaculty(user.id);
      }
      res.json({
        user: req.session.user,
        roleData
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });
  app2.get("/api/auth/me", requireAuth, async (req, res) => {
    try {
      const user = req.session.user;
      let roleData = null;
      if (user.role === "student") {
        roleData = await storage.getStudent(user.id);
      } else if (user.role === "faculty") {
        roleData = await storage.getFaculty(user.id);
      }
      res.json({
        user,
        roleData
      });
    } catch (error) {
      console.error("Auth me error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/students/dashboard", requireAuth, requireRole("student"), async (req, res) => {
    try {
      const userId = req.session.user.id;
      const student = await storage.getStudent(userId);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      const pointsHistory = await storage.getPointsByStudent(student.id);
      const redemptions2 = await storage.getRedemptionsByStudent(student.id);
      const rewards2 = await storage.getActiveRewards();
      res.json({
        student,
        pointsHistory,
        redemptions: redemptions2,
        rewards: rewards2
      });
    } catch (error) {
      console.error("Student dashboard error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/students/redeem", requireAuth, requireRole("student"), async (req, res) => {
    try {
      const userId = req.session.user.id;
      const { rewardId } = req.body;
      const student = await storage.getStudent(userId);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      const rewards2 = await storage.getAllRewards();
      const reward = rewards2.find((r) => r.id === rewardId);
      if (!reward || !reward.isActive || reward.availableQuantity <= 0) {
        return res.status(400).json({ message: "Reward not available" });
      }
      if ((student.totalPoints || 0) < reward.pointCost) {
        return res.status(400).json({ message: "Insufficient points" });
      }
      const redemption = await storage.createRedemption({
        studentId: student.id,
        rewardId: reward.id,
        pointsUsed: reward.pointCost,
        status: "pending"
      });
      res.json(redemption);
    } catch (error) {
      console.error("Redeem error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/faculty/dashboard", requireAuth, requireRole("faculty"), async (req, res) => {
    try {
      const userId = req.session.user.id;
      const faculty = await storage.getFaculty(userId);
      if (!faculty) {
        return res.status(404).json({ message: "Faculty not found" });
      }
      const pointsAssigned = await storage.getPointsAssignedByFaculty(userId);
      const pendingApprovals = await storage.getPendingAttendanceApprovals();
      const students2 = await storage.getAllStudents();
      res.json({
        faculty,
        pointsAssigned,
        pendingApprovals,
        students: students2
      });
    } catch (error) {
      console.error("Faculty dashboard error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/faculty/assign-points", requireAuth, requireRole("faculty"), async (req, res) => {
    try {
      const userId = req.session.user.id;
      const pointsData = insertPointsSchema.parse({
        ...req.body,
        createdBy: userId
      });
      const points2 = await storage.createPoints(pointsData);
      res.json(points2);
    } catch (error) {
      console.error("Assign points error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.patch("/api/faculty/attendance/:id", requireAuth, requireRole("faculty"), async (req, res) => {
    try {
      const { id } = req.params;
      const { approved } = req.body;
      const userId = req.session.user.id;
      await storage.updateAttendanceApproval(parseInt(id), approved, userId);
      res.json({ message: "Attendance updated successfully" });
    } catch (error) {
      console.error("Update attendance error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/admin/dashboard", requireAuth, requireRole("admin"), async (req, res) => {
    try {
      const totalPointsAwarded = await storage.getTotalPointsAwarded();
      const activeStudentsCount = await storage.getActiveStudentsCount();
      const monthlyRedemptions = await storage.getMonthlyRedemptionsCount();
      const facultyCount = await storage.getFacultyCount();
      const topStudents = await storage.getTopStudents(10);
      const departmentStats = await storage.getDepartmentStats();
      const allRedemptions = await storage.getAllRedemptions();
      res.json({
        metrics: {
          totalPointsAwarded,
          activeStudentsCount,
          monthlyRedemptions,
          facultyCount
        },
        topStudents,
        departmentStats,
        recentRedemptions: allRedemptions.slice(0, 10)
      });
    } catch (error) {
      console.error("Admin dashboard error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/admin/rewards", requireAuth, requireRole("admin"), async (req, res) => {
    try {
      const rewards2 = await storage.getAllRewards();
      res.json(rewards2);
    } catch (error) {
      console.error("Get rewards error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/admin/rewards", requireAuth, requireRole("admin"), async (req, res) => {
    try {
      const rewardData = insertRewardSchema.parse(req.body);
      const reward = await storage.createReward(rewardData);
      res.json(reward);
    } catch (error) {
      console.error("Create reward error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.patch("/api/admin/rewards/:id", requireAuth, requireRole("admin"), async (req, res) => {
    try {
      const { id } = req.params;
      const rewardData = req.body;
      await storage.updateReward(parseInt(id), rewardData);
      res.json({ message: "Reward updated successfully" });
    } catch (error) {
      console.error("Update reward error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.delete("/api/admin/rewards/:id", requireAuth, requireRole("admin"), async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteReward(parseInt(id));
      res.json({ message: "Reward deleted successfully" });
    } catch (error) {
      console.error("Delete reward error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/admin/users", requireAuth, requireRole("admin"), async (req, res) => {
    try {
      const students2 = await storage.getAllStudents();
      const faculty = await storage.getAllFaculty();
      res.json({
        students: students2,
        faculty
      });
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/admin/users", requireAuth, requireRole("admin"), async (req, res) => {
    try {
      const { role, ...userData } = req.body;
      const user = await storage.createUser({
        ...userData,
        role
      });
      let roleRecord = null;
      if (role === "student") {
        const studentData = insertStudentSchema.parse({
          userId: user.id,
          rollNumber: userData.rollNumber,
          batch: userData.batch
        });
        roleRecord = await storage.createStudent(studentData);
      } else if (role === "faculty") {
        const facultyData = insertFacultySchema.parse({
          userId: user.id,
          employeeId: userData.employeeId,
          designation: userData.designation
        });
        roleRecord = await storage.createFaculty(facultyData);
      }
      res.json({ user, roleRecord });
    } catch (error) {
      console.error("Create user error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/rewards", requireAuth, async (req, res) => {
    try {
      const rewards2 = await storage.getActiveRewards();
      res.json(rewards2);
    } catch (error) {
      console.error("Get rewards error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/admin/seed", async (req, res) => {
    try {
      await storage.seedDatabase();
      res.json({ message: "Database seeded successfully" });
    } catch (error) {
      console.error("Seed database error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
