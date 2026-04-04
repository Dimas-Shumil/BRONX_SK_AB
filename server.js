require('dotenv').config();

const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.disable('x-powered-by');

app.use(cors());
app.use(express.json({ limit: '200kb' }));
app.use(express.urlencoded({ extended: true, limit: '200kb' }));

app.use(express.static(path.join(__dirname)));

const requiredEnv = [
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_SECURE',
    'SMTP_USER',
    'SMTP_PASS',
    'MAIL_TO'
];

const missingEnv = requiredEnv.filter((key) => !process.env[key]);

if (missingEnv.length) {
    console.error(
        `Отсутствуют переменные окружения: ${missingEnv.join(', ')}`
    );
    process.exit(1);
}

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

app.post('/api/send', async (req, res) => {
    try {
        const {
            name = '',
            phone = '',
            training_type = '',
            trainer = '',
            message = ''
        } = req.body || {};

        const trimmedName = String(name).trim();
        const trimmedPhone = String(phone).trim();
        const trimmedTrainingType = String(training_type).trim();
        const trimmedTrainer = String(trainer).trim();
        const trimmedMessage = String(message).trim();

        const phoneDigits = trimmedPhone.replace(/\D/g, '');

        if (!trimmedName || !trimmedPhone) {
            return res.status(400).json({
                success: false,
                message: 'Заполните обязательные поля.'
            });
        }

        if (trimmedName.length < 2 || trimmedName.length > 80) {
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

        if (!trimmedTrainingType) {
            return res.status(400).json({
                success: false,
                message: 'Выберите тип тренировки.'
            });
        }

        if (
            trimmedTrainingType !== 'Групповая' &&
            trimmedTrainingType !== 'Индивидуальная'
        ) {
            return res.status(400).json({
                success: false,
                message: 'Некорректный тип тренировки.'
            });
        }

        if (trimmedTrainingType === 'Индивидуальная' && !trimmedTrainer) {
            return res.status(400).json({
                success: false,
                message: 'Для индивидуальной тренировки нужно выбрать тренера.'
            });
        }

        const html = `
            <div style="margin:0; padding:0; background:#050505; font-family:Arial, Helvetica, sans-serif; color:#ffffff;">
                <div style="max-width:680px; margin:0 auto; background:#0a0a0a; border:1px solid rgba(255,196,0,0.18);">
                    <div style="
                        padding:32px 28px;
                        background:
                            linear-gradient(180deg, rgba(255,204,0,0.14) 0%, rgba(255,143,0,0.06) 100%),
                            #090909;
                        border-bottom:1px solid rgba(255,196,0,0.18);
                        text-align:center;
                    ">
                        <div style="
                            display:inline-block;
                            padding:8px 14px;
                            border-radius:999px;
                            border:1px solid rgba(255,196,0,0.28);
                            background:rgba(255,255,255,0.03);
                            color:#f5f5f5;
                            font-size:12px;
                            font-weight:700;
                            letter-spacing:1.6px;
                            text-transform:uppercase;
                            margin-bottom:16px;
                        ">
                            Bronx Fight Club
                        </div>

                        <h1 style="
                            margin:0;
                            font-size:30px;
                            line-height:1.1;
                            font-weight:800;
                            color:#ffffff;
                            letter-spacing:1px;
                            text-transform:uppercase;
                        ">
                            Новая заявка
                        </h1>

                        <p style="
                            margin:14px 0 0;
                            font-size:15px;
                            line-height:1.6;
                            color:#d6d6d6;
                        ">
                            С сайта поступила новая заявка на тренировку
                        </p>
                    </div>

                    <div style="padding:28px;">
                        <div style="
                            margin-bottom:18px;
                            padding:18px 20px;
                            background:#111111;
                            border:1px solid rgba(255,196,0,0.14);
                            border-radius:18px;
                        ">
                            <div style="font-size:12px; color:#ffcc00; text-transform:uppercase; letter-spacing:1.2px; margin-bottom:8px;">
                                Имя
                            </div>
                            <div style="font-size:18px; line-height:1.5; color:#ffffff; font-weight:700;">
                                ${escapeHtml(trimmedName)}
                            </div>
                        </div>

                        <div style="
                            margin-bottom:18px;
                            padding:18px 20px;
                            background:#111111;
                            border:1px solid rgba(255,196,0,0.14);
                            border-radius:18px;
                        ">
                            <div style="font-size:12px; color:#ffcc00; text-transform:uppercase; letter-spacing:1.2px; margin-bottom:8px;">
                                Телефон
                            </div>
                            <div style="font-size:18px; line-height:1.5; color:#ffffff; font-weight:700;">
                                ${escapeHtml(trimmedPhone)}
                            </div>
                        </div>

                        <div style="
                            margin-bottom:18px;
                            padding:18px 20px;
                            background:#111111;
                            border:1px solid rgba(255,196,0,0.14);
                            border-radius:18px;
                        ">
                            <div style="font-size:12px; color:#ffcc00; text-transform:uppercase; letter-spacing:1.2px; margin-bottom:8px;">
                                Тип тренировки
                            </div>
                            <div style="font-size:17px; line-height:1.5; color:#ffffff; font-weight:700;">
                                ${escapeHtml(trimmedTrainingType)}
                            </div>
                        </div>

                        <div style="
                            margin-bottom:18px;
                            padding:18px 20px;
                            background:#111111;
                            border:1px solid rgba(255,196,0,0.14);
                            border-radius:18px;
                        ">
                            <div style="font-size:12px; color:#ffcc00; text-transform:uppercase; letter-spacing:1.2px; margin-bottom:8px;">
                                Тренер
                            </div>
                            <div style="font-size:17px; line-height:1.5; color:#ffffff; font-weight:700;">
                                ${escapeHtml(trimmedTrainer || 'Не выбран')}
                            </div>
                        </div>

                        <div style="
                            padding:18px 20px;
                            background:#111111;
                            border:1px solid rgba(255,196,0,0.14);
                            border-radius:18px;
                        ">
                            <div style="font-size:12px; color:#ffcc00; text-transform:uppercase; letter-spacing:1.2px; margin-bottom:8px;">
                                Комментарий
                            </div>
                            <div style="font-size:16px; line-height:1.7; color:#dcdcdc;">
                                ${escapeHtml(trimmedMessage || 'Пользователь не оставил комментарий')}
                            </div>
                        </div>
                    </div>

                    <div style="
                        padding:22px 28px 30px;
                        border-top:1px solid rgba(255,196,0,0.12);
                        background:#080808;
                        text-align:center;
                    ">
                        <div style="
                            display:inline-block;
                            padding:12px 22px;
                            border-radius:999px;
                            background:linear-gradient(180deg, #ffcc00 0%, #ffb300 40%, #ff8f00 100%);
                            color:#111111;
                            font-size:13px;
                            font-weight:800;
                            text-transform:uppercase;
                            letter-spacing:1px;
                        ">
                            Bronx • Новая заявка
                        </div>

                        <p style="
                            margin:16px 0 0;
                            font-size:13px;
                            line-height:1.6;
                            color:#8e8e8e;
                        ">
                            Письмо отправлено автоматически с формы записи на сайте Bronx.
                        </p>
                    </div>
                </div>
            </div>
        `;

        await transporter.sendMail({
            from: `"Bronx сайт" <${process.env.SMTP_USER}>`,
            to: process.env.MAIL_TO,
            subject: 'Новая заявка с сайта Bronx',
            html
        });

        return res.status(200).json({
            success: true,
            message: 'Спасибо! Заявка отправлена, мы скоро свяжемся с вами.'
        });
    } catch (error) {
        console.error('Ошибка сервера при отправке письма:', error);

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
    console.log(`Server started: http://localhost:${PORT}`);
});

function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}