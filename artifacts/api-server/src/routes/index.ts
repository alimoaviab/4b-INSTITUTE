import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import studentsRouter from "./students";
import verificationRouter from "./verification";
import applicationsRouter from "./applications";
import testsRouter from "./tests";
import questionsRouter from "./questions";
import sessionsRouter from "./sessions";
import resultsRouter from "./results";
import interviewsRouter from "./interviews";
import violationsRouter from "./violations";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(studentsRouter);
router.use(verificationRouter);
router.use(applicationsRouter);
router.use(testsRouter);
router.use(questionsRouter);
router.use(sessionsRouter);
router.use(resultsRouter);
router.use(interviewsRouter);
router.use(violationsRouter);
router.use(dashboardRouter);

export default router;
