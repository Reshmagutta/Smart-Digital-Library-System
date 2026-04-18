export const askAI = async (prompt) => {
  try {
    const res = await fetch("http://localhost:5000/api/ai/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    const data = await res.json();
    return data.reply;

  } catch (error) {
    console.error("AI Error:", error);
    return "Something went wrong";
  }
};