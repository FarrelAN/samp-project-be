import Feedback from "../models/feedbackModel.js";

const sanitizeText = (text) => {
  if (!text) return ""; // Return an empty string if text is undefined or null

  const patterns = [
    /Bank Mandiri/gi,
    /Mandiri/gi,
    /BMRI/gi,
    /Sistem Mandiri/gi,
    /Plaza Mandiri/gi,
    /Plazman/gi,
    /Mantos/gi,
    /Bank/gi,
  ];

  let sanitizedText = text;
  patterns.forEach((pattern) => {
    sanitizedText = sanitizedText.replace(pattern, "Company X");
  });
  return sanitizedText;
};

const getAllFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({});
    res.status(200).json(feedbacks);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

const getFeedback = async (req, res) => {
  try {
    const { id: feedbackId } = req.params;

    const feedback = await Feedback.findOne({ id_kasus: feedbackId });
    res.status(200).json(feedback);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

const analyzeFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({});
    const descriptions = feedbacks.map(
      (feedback) => feedback.deskripsi_aktivitas || ""
    );

    const sanitizedDescriptions = descriptions.map((desc) =>
      sanitizeText(desc)
    );

    const sanitizedDeskripsiAktivitas = sanitizedDescriptions.join("\n\n");
    const query = `
      Analyze the following descriptions of cyber incidents and generate a full explanation on the most common causes or vulnerabilities of users that can be inferred from all these cases? What are efficient ways security awareness team can do based on these cases? Answer in 2 paragraph maximum: ${sanitizedDeskripsiAktivitas}
    `;

    console.log("Query for OpenAI:", query);

    const getResponseFromOpenAI = async (query) => {
      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.SECRET_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "system",
                content: [
                  {
                    type: "text",
                    text: "You are a cybersecurity case analyst",
                  },
                ],
              },
              { role: "user", content: query },
            ],
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Response from OpenAI:", data);
      return data.choices[0]?.message?.content || "No response from OpenAI";
    };

    const aiResponse = await getResponseFromOpenAI(query);

    res.status(200).json({ analysis: aiResponse });
  } catch (error) {
    console.error("Error in analyzeFeedbacks:", error);
    res.status(500).json({ msg: error.message });
  }
};

export { getAllFeedbacks, getFeedback, analyzeFeedbacks };
