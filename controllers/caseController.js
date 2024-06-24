import Case from "../models/caseModel.js";

const regions = [
  "Region I - Sumatera 1",
  "Region II - Sumatera 2",
  "Region III - Jakarta 1",
  "Region IV - Jakarta 2",
  "Region V - Jakarta 3",
  "Region VI - Jawa 1",
  "Region VII - Jawa 2",
  "Region VIII - Jawa 3",
  "Region IX - Kalimantan",
  "Region X - Sulawesi & Maluku",
  "Region XI - Bali & Nusa Tenggara",
  "Region XII - Papua",
];

const getAllCases = async (req, res) => {
  try {
    const cases = await Case.find({});

    const updatedCases = await Promise.all(
      cases.map(async (caseDoc) => {
        if (!caseDoc.timestamps.open) {
          caseDoc.timestamps.open = new Date();
        }
        if (!caseDoc.region) {
          const randomRegion =
            regions[Math.floor(Math.random() * regions.length)];
          caseDoc.region = randomRegion;
        }
        await caseDoc.save();
        return caseDoc;
      })
    );

    res.status(200).json(updatedCases);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

const getCase = async (req, res) => {
  try {
    const { id: caseId } = req.params;

    const casse = await Case.findOne({ _id: caseId });
    res.status(200).json(casse);
  } catch (error) {
    res.status(500).json({ msg: error });
  }
};

const getCaseStatusCounts = async (req, res) => {
  try {
    const caseStatusCounts = await Case.aggregate([
      { $group: { _id: "$case_status", count: { $sum: 1 } } },
      { $project: { _id: 0, case_status: "$_id", count: 1 } },
    ]);

    const result = caseStatusCounts.reduce((acc, item) => {
      acc[item.case_status] = item.count;
      return acc;
    }, {});

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createCase = async (req, res) => {
  try {
    const acase = await Case.create(req.body);
    res.status(201).send(acase);
  } catch (error) {
    res.status(500).json({ msg: error });
  }
};

const updateCaseStatus = async (req, res) => {
  try {
    const { id: taskID } = req.params;
    const { case_status } = req.body;

    const updateData = { case_status };

    // Set the appropriate timestamp based on the new status
    switch (case_status) {
      case "OPEN":
        updateData["timestamps.open"] = new Date();
        break;
      case "ON PROGRESS":
        updateData["timestamps.in_progress"] = new Date();
        break;
      case "REVIEW":
        updateData["timestamps.awaiting_review"] = new Date();
        break;
      case "CLOSED":
        updateData["timestamps.closed"] = new Date();
        break;
      default:
        break;
    }

    const acase = await Case.findByIdAndUpdate(
      { _id: taskID },
      { $set: updateData },
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).send(acase);
  } catch (error) {
    res.status(500).json({ msg: error });
  }
};

const getAdminData = async (req, res) => {
  try {
    // Case Status Count
    const caseStatusCounts = await Case.aggregate([
      { $group: { _id: "$case_status", count: { $sum: 1 } } },
      { $project: { _id: 0, case_status: "$_id", count: 1 } },
    ]);

    const caseStatusResult = caseStatusCounts.reduce((acc, item) => {
      acc[item.case_status] = item.count;
      return acc;
    }, {});

    // Country Heatmap
    const countryCounts = await Case.aggregate([
      { $group: { _id: "$location", count: { $sum: 1 } } },
      { $project: { _id: 0, location: "$_id", count: 1 } },
    ]);

    const countryResult = countryCounts.reduce((acc, item) => {
      acc[item.location] = item.count;
      return acc;
    }, {});

    // Region Data
    const regionCounts = await Case.aggregate([
      { $group: { _id: "$region", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $project: { _id: 0, region: "$_id", count: 1 } },
    ]);

    const regionResult = regionCounts.reduce((acc, item) => {
      acc[item.region] = item.count;
      return acc;
    }, {});

    // Job Level by Top 5 Regions
    const jobLevelByTopRegions = await Case.aggregate([
      { $match: { region: { $in: Object.keys(regionResult) } } },
      {
        $group: {
          _id: { region: "$region", job_level: "$job_level" },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.region",
          jobLevels: {
            $push: { job_level: "$_id.job_level", count: "$count" },
          },
        },
      },
      {
        $project: {
          _id: 0,
          region: "$_id",
          mostFrequentJobLevel: {
            $arrayElemAt: [
              {
                $filter: {
                  input: "$jobLevels",
                  as: "jobLevel",
                  cond: {
                    $eq: ["$$jobLevel.count", { $max: "$jobLevels.count" }],
                  },
                },
              },
              0,
            ],
          },
        },
      },
    ]);

    const jobLevelByRegionResult = jobLevelByTopRegions.reduce((acc, item) => {
      acc[item.region] = item.mostFrequentJobLevel;
      return acc;
    }, {});

    // High Severity Cases or Case Score of 30 or higher
    const highSeverityCases = await Case.aggregate([
      {
        $addFields: {
          case_score_int: { $toInt: "$case_score" },
        },
      },
      {
        $match: {
          case_score_int: { $gte: 30 },
        },
      },
      {
        $count: "highSeverityCount",
      },
    ]);

    const highSeverityCount =
      highSeverityCases.length > 0 ? highSeverityCases[0].highSeverityCount : 0;

    // Incoming Number of Cases from 30 Days Ago to Now
    const nowDate = new Date();
    const startDate = new Date(nowDate);
    startDate.setDate(nowDate.getDate() - 90);

    const incomingCases = await Case.find({
      created_at: {
        $gte: startDate.toISOString().split("T")[0], // Truncate time
        $lte: nowDate.toISOString().split("T")[0], // Truncate time
      },
    }).countDocuments();

    // Bar Chart of Number of Cases per Job Level
    const jobLevelCounts = await Case.aggregate([
      {
        $group: {
          _id: { $toUpper: "$job_level" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          job_level: "$_id",
          count: 1,
        },
      },
    ]);

    const jobLevelResult = jobLevelCounts.reduce((acc, item) => {
      acc[item.job_level] = item.count;
      return acc;
    }, {});

    // Average times for status transitions
    const cases = await Case.find({});

    const openToClosedTimes = [];
    const onProgressToReviewTimes = [];
    const openToOnProgressTimes = [];

    cases.forEach((caseDoc) => {
      if (caseDoc.timestamps.open && caseDoc.timestamps.closed) {
        openToClosedTimes.push(
          caseDoc.timestamps.closed - caseDoc.timestamps.open
        );
      }
      if (
        caseDoc.timestamps.in_progress &&
        caseDoc.timestamps.awaiting_review
      ) {
        onProgressToReviewTimes.push(
          caseDoc.timestamps.awaiting_review - caseDoc.timestamps.in_progress
        );
      }
      if (caseDoc.timestamps.open && caseDoc.timestamps.in_progress) {
        openToOnProgressTimes.push(
          caseDoc.timestamps.in_progress - caseDoc.timestamps.open
        );
      }
    });

    const average = (arr) => arr.reduce((a, b) => a + b, 0) / (arr.length || 1);

    const time_caseComplete = average(openToClosedTimes) / (1000 * 60 * 60); // convert to hours
    const time_IAM = average(onProgressToReviewTimes) / (1000 * 60 * 60); // convert to hours
    const time_SOC = average(openToOnProgressTimes) / (1000 * 60 * 60); // convert to hours

    // Combine all results into a single response object
    const result = {
      caseStatusCounts: caseStatusResult,
      countryHeatmap: countryResult,
      regionCounts: regionResult,
      jobLevelByRegion: jobLevelByRegionResult,
      highSeverityCases,
      incomingCases,
      jobLevelCounts: jobLevelResult,
      time_caseComplete,
      time_IAM,
      time_SOC,
    };

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export {
  getAllCases,
  createCase,
  updateCaseStatus,
  getCase,
  getCaseStatusCounts,
  getAdminData,
};
