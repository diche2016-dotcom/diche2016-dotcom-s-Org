import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize Gemini Client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// 1. OCR & Table extraction from Student List Image / Document
app.post('/api/ai/ocr-students', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType, textInput } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(503).json({
        error: 'لم يتم العثور على مفتاح GEMINI_API_KEY. يرجى إعداده في لوحة الأسرار.',
      });
    }

    const systemPrompt = `أنت خبير فائق الذكاء في استخراج وتنظيم قوائم تلاميذ التعليم الابتدائي في الجزائر والدول المغاربية والعربية.
مهمتك: تحليل الصورة أو النص المدخل واستخراج جدول التلاميذ بدقة متناهية، والتعرف على الأعمدة وتصحيح الترتيب (RTL أو LTR).
الأعمدة المطلوبة:
- registrationNumber: رقم التسجيل أو رقم التلميذ (string, مثل "01", "102")
- lastName: اللقب (string)
- firstName: الاسم (string)
- birthDate: تاريخ الميلاد بصيغة YYYY-MM-DD أو كما هو مسجل (string)
- gender: الجنس ("M" للذكر / "F" للأنثى)
- parentName: اسم ولي الأمر إن وجد (string)
- parentPhone: رقم هاتف الولي إن وجد (string)
- notes: ملاحظات أو تحذير إذا كان هناك حقل غير مؤكد (string)
- confidenceWarning: ملاحظة إذا كانت الصورة مشوشة أو الحقل غير واضح، مثلاً "تاريخ الميلاد غير واضح يحتاج مراجعة"

أرجع البيانات بصيغة JSON حصراً على النحو التالي:
{
  "students": [
    {
      "registrationNumber": "01",
      "lastName": "بن علي",
      "firstName": "محمد",
      "birthDate": "2016-04-12",
      "gender": "M",
      "parentName": "علي بن علي",
      "parentPhone": "0661234567",
      "notes": "",
      "confidenceWarning": ""
    }
  ],
  "detectedColumns": ["الرقم", "اللقب", "الاسم", "تاريخ الميلاد", "الجنس"],
  "summary": "تم استخراج 28 تلميذاً بنجاح"
}
لا تضف أي نص خارج كائن JSON.`;

    let contents: any;
    if (imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, '');
      contents = {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType || 'image/jpeg',
            },
          },
          {
            text: 'استخرج قائمة التلاميذ من هذا الجدول بدقة متناهية إلى JSON.',
          },
        ],
      };
    } else {
      contents = `قم بتحليل هذا النص أو الجدول واستخراج قائمة التلاميذ بدقة إلى JSON: \n\n${textInput || ''}`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '{}';
    const parsedData = JSON.parse(responseText);
    res.json(parsedData);
  } catch (error: any) {
    console.error('Error in OCR extraction:', error);
    res.status(500).json({
      error: error.message || 'فشل في استخراج قائمة التلاميذ بالذكاء الاصطناعي',
    });
  }
});

// 2. Lesson Plan Generator (صمم مذكرتي)
app.post('/api/ai/lesson-plan', async (req: Request, res: Response) => {
  try {
    const { subject, gradeLevel, domain, section, title, customNotes, lengthOption } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(503).json({
        error: 'مفتاح GEMINI_API_KEY غير متوفر. تأكد من تفعيله في لوحة الأسرار.',
      });
    }

    const prompt = `أنت مفتش ومستشار تربوي خبير في منهاج التعليم الابتدائي الجزائري (المناهج المخففة والجيل الثاني).
صمم مذكرة تربوية نموذجية واحترافية للدرس التالي:
- المادة: ${subject || 'اللغة العربية'}
- المستوى: ${gradeLevel || 'السنة الرابعة ابتدائي'}
- الميدان / المجال: ${domain || 'فهم المنطوق والتعبير الشفوي / الحساب والعمليات'}
- المقطع التعلمي: ${section || 'المقطع الأول'}
- عنوان الدرس: ${title || 'الجمع بالاحتفاظ'}
- ملاحظات المعلم وإضافاته: ${customNotes || 'لا توجد'}
- نمط العرض: ${lengthOption || 'مفصل وشامل'}

يجب أن تتضمن المذكرة البنية الجزائرية الرسمية الدقيقة بصيغة JSON:
{
  "header": {
    "subject": "${subject}",
    "gradeLevel": "${gradeLevel}",
    "domain": "${domain}",
    "section": "${section}",
    "lessonTitle": "${title}",
    "competence": "الكفاءة الختامية",
    "components": "مركبات الكفاءة",
    "indicators": "مؤشرات الكفاءة / مؤشرات النجاح",
    "materials": "الوسائل والسنادات التعليمية",
    "duration": "45 دقيقة"
  },
  "stages": [
    {
      "stageName": "مرحلة الانطلاق (وضعية الانطلاق)",
      "duration": "10 د",
      "teacherActivity": "ما يفعله المعلم وتوجيهاته وأسئلته التشخيصية",
      "studentActivity": "ما يقوم به التلميذ والملاحظات المتوقعة",
      "assessment": "تقويم تشخيصي / معايير التقويم"
    },
    {
      "stageName": "مرحلة بناء التعلمات (التحليل والاستنتاج)",
      "duration": "25 د",
      "teacherActivity": "طرح الوضعية المشكلة، تنظيم أفواج العمل، التوجيه والمرافقة",
      "studentActivity": "الملاحظة، التفكير، الاكتشاف، الصياغة الأولية للاستنتاج",
      "assessment": "تقويم تكويني مرحلي"
    },
    {
      "stageName": "مرحلة التدريب والاستثمار (الاستثمار والتقويم)",
      "duration": "10 د",
      "teacherActivity": "تقديم تمرين تطبيقي على الألواح أو الكراس والمراقبة الفردية",
      "studentActivity": "إنجاز النشاط الفردي والتحقق الذاتي",
      "assessment": "تقويم تحصيلي"
    }
  ],
  "summary": "الخلاصة أو القاعدة المعرفية التي تسجل على السبورة والدفتر",
  "remedialActivity": "نشاط علاجي داعم للتلاميذ الذين لم يستوعبوا المهارة",
  "enrichmentActivity": "نشاط إثرائي للتلاميذ المتفوقين",
  "homework": "تمرين بسيط للواجب المنزلي"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Error generating lesson plan:', error);
    res.status(500).json({ error: error.message || 'فشل في توليد المذكرة' });
  }
});

// 3. Exam & Test Generator (مولد الاختبارات والتقويمات)
app.post('/api/ai/exam-generator', async (req: Request, res: Response) => {
  try {
    const { gradeLevel, subject, topic, questionCount, difficulty, duration, questionTypes } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(503).json({
        error: 'مفتاح GEMINI_API_KEY غير متوفر.',
      });
    }

    const prompt = `أنت معلم ابتدائي خبير ومصمم اختبارات وبنوك أسئلة وفق المنظومة التربوية الرسمية.
قم بتوليد موضوع اختبار رسمي ومتوازن:
- المستوى: ${gradeLevel || 'السنة الثالثة ابتدائي'}
- المادة: ${subject || 'الرياضيات'}
- الموضوع أو الدروس: ${topic || 'الأعداد والحساب والقياس'}
- عدد الأسئلة: ${questionCount || 4}
- الصعوبة: ${difficulty || 'متوسط'}
- المدة المقترحة: ${duration || '45 دقيقة'}
- أنواع الأسئلة المفضلة: ${JSON.stringify(questionTypes || ['MCQ', 'direct', 'problem'])}

أرجع الاختبار بصيغة JSON دقيقة مع التصحيح النموذجي وسلم التنقيط على 10 نقاط:
{
  "examTitle": "تقويم الفصل الدراسي",
  "gradeLevel": "${gradeLevel}",
  "subject": "${subject}",
  "duration": "${duration}",
  "totalPoints": 10,
  "instructions": "تعليمات للتلميذ",
  "questions": [
    {
      "id": 1,
      "type": "اختيار من متعدد / تمرين قصير / مسألة",
      "text": "نص السؤال أو التمرين",
      "options": ["خيار أ", "خيار ب", "خيار ج"],
      "points": 2,
      "modelAnswer": "الإجابة النموذجية الصحيحة بالتفصيل",
      "gradingCriteria": "معيار التصحيح وملاحظة المعلم"
    }
  ],
  "modelAnswerSummary": "ملخص عام للتصحيح وسلم التقييم الكامل"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Error in exam generation:', error);
    res.status(500).json({ error: error.message || 'فشل في توليد الاختبار' });
  }
});

// 4. Student Results & Progress Analysis (تحليل النتائج بالذكاء الاصطناعي)
app.post('/api/ai/analyze-results', async (req: Request, res: Response) => {
  try {
    const { classSummary, subjectStats, strugglingStudents, topStudents } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(503).json({
        error: 'مفتاح GEMINI_API_KEY غير متوفر.',
      });
    }

    const prompt = `أنت مستشار توجيه ومحلل بيداغوجي تربوي للتعليم الابتدائي.
حلل نتائج هذا القسم وقدم تقريراً تشخيصياً واقتراحات علاجية عملية للأستاذ:
بيانات القسم:
${JSON.stringify({ classSummary, subjectStats, strugglingStudents, topStudents }, null, 2)}

أرجع النتيجة بصيغة JSON تحتوي على:
{
  "strengths": ["نقاط القوة التي حققها القسم"],
  "weaknesses": ["الصعوبات الشائعة والتعثرات الملاحظة"],
  "skillsNeedingSupport": [
    {
      "skillName": "اسم المهارة المعقدة",
      "subject": "المادة",
      "diagnostics": "سبب التعثر المحتمل"
    }
  ],
  "remedialSuggestions": [
    {
      "title": "خطة معالجة مقترحة",
      "targetGroup": "التلاميذ ذوو المعدلات دون 5 أو المتعثرون في الحساب",
      "exerciseIdea": "فكرة نشاط علاجي ملموس وممتع داخل القسم"
    }
  ],
  "pedagogicalAdvice": "نصيحة تربوية للأستاذ للأسابيع القادمة"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Error in results analysis:', error);
    res.status(500).json({ error: error.message || 'فشل في تحليل النتائج' });
  }
});

// 5. Parent Report Generator (تقرير ورسالة ولي الأمر)
app.post('/api/ai/parent-report', async (req: Request, res: Response) => {
  try {
    const { studentName, gradeLevel, average, attendanceRate, behavior, reportType, subjectRemarks } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(503).json({
        error: 'مفتاح GEMINI_API_KEY غير متوفر.',
      });
    }

    const prompt = `أنت معلم ابتدائي حريص ومربٍ فاضل.
اكتب رسالة تقريرية موجهة لولي أمر التلميذ:
- اسم التلميذ: ${studentName}
- المستوى: ${gradeLevel}
- المعدل العام: ${average} / 10
- نسبة الحضور: ${attendanceRate}%
- السلوك والانضباط: ${behavior || 'حسن وهادئ'}
- نوع التقرير: ${reportType || 'تقرير فصلي'}
- ملاحظات المواد: ${JSON.stringify(subjectRemarks || {})}

شروط الرسالة:
- تربوية، محترمة، إيجابية، واقعية وغير جارحة إطلاقاً.
- تثمن نقاط القوة والجهد المبذول.
- توضح الصعوبات بأسلوب تشجيعي تعاوني مع نصائح واضحة للمنزل.
- توقيع أستاذ القسم.

أرجع النتيجة بصيغة JSON:
{
  "title": "تقرير المتابعة التربوية للولي الكريم",
  "greeting": "تحية طيبة مباركة وبعد...",
  "generalAssessment": "تقييم تربوي شامل لمسار التلميذ",
  "highlights": ["إيجابيات التلميذ وسلوكياته المشكورة"],
  "areasForImprovement": ["نقاط تحتاج رعاية واهتماماً مشتركاً في المنزل"],
  "homeRecommendations": ["توصيات عملية وممتعة للولي لدعم ابنه"],
  "closing": "عبارة ختامية محفزة ودعوة للتواصل إن لزم الأمر",
  "fullLetterText": "نص الرسالة الكامل والمنسق الجاهز للطباعة والتوقيع"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Error in parent report generation:', error);
    res.status(500).json({ error: error.message || 'فشل في توليد تقرير ولي الأمر' });
  }
});

// 6. Pedagogical AI Chat Assistant (مساعدي)
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  try {
    const { message, conversationHistory } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(503).json({
        error: 'مفتاح GEMINI_API_KEY غير متوفر. تأكد من تفعيله في لوحة الأسرار.',
      });
    }

    const systemInstruction = `أنت "مساعدي" — المساعد الذكي لمعلم التعليم الابتدائي في تطبيق "قسمي".
أنت متخصص في البيداغوجيا الحديثة والديداكتيك، والمنهاج الدراسي الجزائري والمغاربي والعربي، واستراتيجيات إدارة الصف، والأنشطة التفاعلية، والتقويم التكويني والتشخيصي، وحل مشكلات عسر القراءة والحساب، والتواصل مع الأولياء.
إجاباتك دقيقة، مشجعة، عملية ومباشرة، وتدعم المعلم بكل احترام وتقدير لمهنته النبيلة.`;

    const contents = [
      ...(conversationHistory || []).map((msg: any) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      })),
      {
        role: 'user',
        parts: [{ text: message }],
      },
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
      },
    });

    res.json({ reply: response.text || 'عذراً، لم أتمكن من صياغة إجابة.' });
  } catch (error: any) {
    console.error('Error in AI chat:', error);
    res.status(500).json({ error: error.message || 'فشل المساعد الذكي' });
  }
});

// Mount Vite or serve static
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`قسمي server running on port ${PORT}`);
  });
}

startServer();
