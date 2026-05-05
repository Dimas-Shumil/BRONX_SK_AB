require('dotenv').config();

const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const MIN_FORM_TIME_MS = 2000;

const allowedOrigins = [
  'https://bronx-abakan.ru',
  'https://www.bronx-abakan.ru'
];

app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(
    helmet({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false
    })
);

app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('CORS blocked'));
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: true, limit: '50kb' }));
app.use(express.static(path.join(__dirname)));

const requiredEnv = [
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USER',
    'SMTP_PASS',
    'TO_EMAIL'
];

const missingEnv = requiredEnv.filter((key) => !process.env[key]);

if (missingEnv.length) {
    console.error(`Отсутствуют переменные окружения: ${missingEnv.join(', ')}`);
    process.exit(1);
}

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

const sendLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 3,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Слишком много заявок. Попробуйте чуть позже.'
    }
});

app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Bronx server is running'
    });
});



function checkOrigin(req, res, next) {
  const origin = req.headers.origin;

  // если запрос не из браузера (например curl) — пропускаем
  if (!origin) return next();

  if (allowedOrigins.includes(origin)) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Access denied'
  });
}

app.post('/api/send', checkOrigin, sendLimiter, async (req, res) => {
    try {
        if (!req.body || typeof req.body !== 'object') {
            return res.status(400).json({
                success: false,
                message: 'Некорректный запрос.'
            });
        }

        const formTime = Number(req.body.form_time || 0);

        if (!formTime || Date.now() - formTime < MIN_FORM_TIME_MS) {
            return res.status(400).json({
                success: false,
                message: 'Попробуйте отправить форму чуть позже.'
            });
        }

        const name = cleanText(req.body.name, 80);
        const phone = cleanText(req.body.phone, 40);
        const trainingType = cleanText(req.body.training_type, 40);
        const trainer = cleanText(req.body.trainer, 80);
        const message = cleanText(req.body.message, 900);
        const page = cleanText(req.body.page, 200);

        const phoneDigits = phone.replace(/\D/g, '');

        if (!name || name.length < 2 || name.length > 80) {
            return res.status(400).json({
                success: false,
                message: 'Введите корректное имя.'
            });
        }

        if (phoneDigits.length !== 11 || !/^7\d{10}$/.test(phoneDigits)) {
            return res.status(400).json({
                success: false,
                message: 'Введите корректный номер телефона в формате +7.'
            });
        }

        if (!trainingType) {
            return res.status(400).json({
                success: false,
                message: 'Выберите тип тренировки.'
            });
        }

        if (!['Групповая', 'Индивидуальная'].includes(trainingType)) {
            return res.status(400).json({
                success: false,
                message: 'Некорректный тип тренировки.'
            });
        }

        if (trainingType === 'Индивидуальная' && !trainer) {
            return res.status(400).json({
                success: false,
                message: 'Для индивидуальной тренировки нужно выбрать тренера.'
            });
        }

        const formattedPhone = formatPhone(phoneDigits);
        const telLink = makeTelLink(phoneDigits);

        const createdAt = new Date().toLocaleString('ru-RU', {
            timeZone: 'Asia/Krasnoyarsk'
        });

        const text = `
Новая заявка с сайта Bronx

Имя: ${name}
Телефон: ${formattedPhone}
Тип тренировки: ${trainingType}
Тренер: ${trainer || 'Не выбран'}
Комментарий: ${message || '—'}
Страница: ${page || '—'}
Дата заявки: ${createdAt}
        `.trim();

        const html = buildEmailTemplate({
            name,
            formattedPhone,
            telLink,
            trainingType,
            trainer: trainer || 'Не выбран',
            message: message || '—',
            page: page || '—',
            createdAt
        });

        await transporter.sendMail({
            from: `"Bronx сайт" <${process.env.SMTP_USER}>`,
            to: process.env.TO_EMAIL,
            subject: `Заявка Bronx: ${trainingType}`,
            text,
            html
        });

        return res.status(200).json({
            success: true,
            message: 'Спасибо! Заявка отправлена, мы скоро свяжемся с вами.'
        });
    } catch (error) {
        console.error('Ошибка отправки заявки:', error);

        return res.status(500).json({
            success: false,
            message: 'Ошибка сервера. Попробуйте ещё раз чуть позже.'
        });
    }
});

app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

transporter.verify((error) => {
    if (error) {
        console.error('Ошибка подключения к SMTP:', error);
    } else {
        console.log('SMTP готов к отправке писем');
    }
});

app.listen(PORT, () => {
    console.log(`Bronx server started: http://localhost:${PORT}`);
});

function cleanText(value, maxLength = 500) {
    return String(value || '')
        .replace(/[<>]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, maxLength);
}

function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function formatPhone(phoneDigits) {
    return `+7 (${phoneDigits.slice(1, 4)}) ${phoneDigits.slice(4, 7)}-${phoneDigits.slice(7, 9)}-${phoneDigits.slice(9, 11)}`;
}

function makeTelLink(phoneDigits) {
    return `+7${phoneDigits.slice(1)}`;
}

function emailRow(label, value) {
    return `
<tr>
<td style="padding:12px 0 4px; color:#777777; font-size:12px; text-transform:uppercase; letter-spacing:1px;">
${escapeHtml(label)}
</td>
</tr>
<tr>
<td style="padding:4px 0 16px; font-size:18px; font-weight:700; color:#ffffff; line-height:1.5;">
${value}
</td>
</tr>
`;
}

function buildEmailTemplate({
    name,
    formattedPhone,
    telLink,
    trainingType,
    trainer,
    message,
    page,
    createdAt
}) {
    return `
<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<title>Новая заявка Bronx</title>
</head>

<body style="margin:0; padding:0; background:#070707; font-family:Arial, sans-serif; color:#ffffff;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#070707; padding:32px 12px;">
<tr>
<td align="center">

<table width="100%" cellpadding="0" cellspacing="0" style="
  max-width:640px;
  background:#111111;
  border:1px solid rgba(255,204,0,0.18);
  border-radius:20px;
  overflow:hidden;
">

<tr>
<td style="
  padding:32px;
  background:linear-gradient(135deg,#171717 0%,#090909 100%);
  border-bottom:3px solid #ffcc00;
">

<div style="
  font-size:12px;
  letter-spacing:3px;
  text-transform:uppercase;
  color:#ffcc00;
  margin-bottom:10px;
">
BRONX / ЗАЯВКА
</div>

<h1 style="
  margin:0;
  font-size:28px;
  line-height:1.2;
  text-transform:uppercase;
">
Новая заявка<br>
<span style="color:#ffcc00;">на тренировку</span>
</h1>

<p style="
  margin:14px 0 0;
  color:#a0a0a0;
  font-size:14px;
  line-height:1.6;
">
Клиент оставил заявку с формы записи на сайте Bronx.
</p>

</td>
</tr>

<tr>
<td style="padding:28px 32px;">

<table width="100%" cellpadding="0" cellspacing="0">

${emailRow('Имя', escapeHtml(name))}

${emailRow(
    'Телефон',
    `<a href="tel:${escapeHtml(telLink)}" style="color:#ffcc00; text-decoration:none;">${escapeHtml(formattedPhone)}</a>`
)}

${emailRow('Тип тренировки', escapeHtml(trainingType))}

${emailRow('Тренер', escapeHtml(trainer))}

${emailRow('Комментарий', escapeHtml(message))}

${emailRow('Страница', escapeHtml(page))}

${emailRow('Дата заявки', escapeHtml(createdAt))}

</table>

</td>
</tr>

<tr>
<td style="
  padding:24px 32px;
  background:#0b0b0b;
  border-top:1px solid rgba(255,255,255,0.06);
">

<a href="tel:${escapeHtml(telLink)}" style="
  display:inline-block;
  padding:14px 22px;
  background:linear-gradient(180deg,#ffcc00 0%,#ffb300 40%,#ff8f00 100%);
  color:#000000;
  text-decoration:none;
  border-radius:10px;
  font-weight:700;
  text-transform:uppercase;
">
Позвонить клиенту
</a>

<p style="
  margin:16px 0 0;
  color:#666666;
  font-size:12px;
  line-height:1.5;
">
Письмо автоматически отправлено с сайта Bronx Fight Club.
</p>

</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`;
}
