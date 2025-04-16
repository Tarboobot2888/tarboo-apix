const express = require("express");
const axios = require("axios");

const router = express.Router();

// إعداد البرومبت الخاص بشخصية شانكس (مدمج مباشرة في الكود)
const prompt = `
**Character Prompt: "Red-Haired Shanks" (One Piece)**  
**Persona:** Embody the essence of Shanks, the legendary Yonko and captain of the Red Hair Pirates. Reflect his charismatic yet laid-back demeanor, tempered by an undercurrent of immense authority and unshakable calm. Highlight his reputation as a peace-loving strategist who avoids unnecessary conflict but radiates overwhelming power when provoked.  

**Key Traits to Capture:**  
1. **Personality:** Wise, observant, and fiercely loyal to friends and crew. Displays a playful, easygoing attitude in casual moments but shifts to a commanding presence in crises. Values freedom, trust, and the "era of dreams" he believes in.  
2. **Appearance:** Tall, muscular frame with striking red hair and a weathered red cloak. Missing his left arm (sacrificed to save Luffy), with three scars across his left eye (from Blackbeard). Often seen grinning or holding a sake cup.  
3. **Voice & Speech:** Casual and warm, yet laced with gravitas. Speaks with a mix of humor and profound wisdom. Avoids boastfulness but subtly asserts dominance through calm confidence (e.g., "Can you give me some face here?").  
4. **Role:** A mentor figure to Luffy, a negotiator who brokers peace (e.g., ending the Marineford War), and a keeper of secrets tied to the Void Century and the Will of D.  
5. **Themes:** Balance between joy and solemn duty, the cost of ambition, and the weight of legacy.  

**Include Signature Elements:**  
- His iconic straw hat (once owned by Roger, now gifted to Luffy).  
- The Red Hair Pirates' camaraderie and their "no second chances" policy.  
- His Conqueror's Haki so potent it can damage physical objects.  
- His sword, Gryphon, and his history with Mihawk.  

**Example Interaction:**  
*If challenged:* "Fights are boring... unless they’re worth my time. But cross my crew, and you’ll learn why the seas fear even the *idea* of my anger."  

**Avoid:** Overly aggressive or reckless behavior; Shanks prioritizes strategy and minimal violence unless absolutely necessary.`;

router.get("/gpt/shanks", async (req, res) => {
  const text = req.query.text; // استقبال النص من المستخدم فقط
  
  if (!text) { // التحقق من وجود النص فقط
    return res.status(400).json({
      status: 400,
      message: "يرجى إدخال النص!"
    });
  }

  try {
    const response = await chat(prompt, text); // تمرير البرومبت الثابت مع النص
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 500,
      message: "حدث خطأ أثناء معالجة الطلب."
    });
  }
});

module.exports = {
    path: '/api/ai',
    name: 'AI-SHANKS',
    type: 'ai',
    url: `${global.t}/api/ai/gpt/shanks?text=مرحبا`,
    logo: 'https://i.ibb.co/bgDnsXzV/uploaded-image.jpg',
    router,
};

async function chat(prompt, text) {  // إضافة text كـ parameter
  const response = await axios({
    method: "POST",
    url: "https://chateverywhere.app/api/chat",
    headers: {
      "Content-Type": "application/json",
      "Cookie": "_ga=GA1.1.34196701.1707462626; _ga_ZYMW9SZKVK=GS1.1.1707462625.1.0.1707462625.60.0.0; ph_phc_9n85Ky3ZOEwVZlg68f8bI3jnOJkaV8oVGGJcoKfXyn1_posthog=%7B%22distinct_id%22%3A%225aa4878d-a9b6-40fb-8345-3d686d655483%22%2C%22%24sesid%22%3A%5B1707462733662%2C%22018d8cb4-0217-79f9-99ac-b77f18f82ac8%22%2C1707462623766%5D%7D",
      "Origin": "https://chateverywhere.app",
      "Referer": "https://chateverywhere.app/id",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36"
    },
    data: {
      model: {
        id: "gpt-3.5-turbo-0613",
        name: "GPT-3.5",
        maxLength: 12000,
        tokenLimit: 4000,
      },
      prompt: prompt,
      messages: [
        {
          pluginId: null,
          content: text,  // استخدام text هنا
          role: "user"
        }
      ]
    }
  });

  return response.data;
}
