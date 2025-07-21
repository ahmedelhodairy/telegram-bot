const { Telegraf, Markup } = require('telegraf');
const nodemailer = require('nodemailer');

const bot = new Telegraf('8139291683:AAE2nRII6nfckOeIP_fueo9-c5ownm01yrY'); // ← حط التوكن هنا
const ADMIN_ID = 7040408619; // ← ID الأدمن هنا

let userRequests = {}; // لحفظ الطلبات مؤقتًا

// إعداد Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'ggdhdhdb5@gmail.com',       // ← الإيميل الحقيقي
    pass: 'qlro hktn lnjm famg'   // ← كلمة سر تطبيقية
  }
});

bot.start((ctx) => {
  ctx.reply("👋 أهلاً! من فضلك ابعت رقم هاتفك والمشكلة في سطر واحد.\n\nمثال:\n📱 01111111111 لم يصلني كود التفعيل");
});

bot.on('text', async (ctx) => {
  if (ctx.from.id === ADMIN_ID) return;

  const message = ctx.message.text.trim();
  const userId = ctx.from.id;

  userRequests[userId] = message;

  await ctx.reply("✅ تم إرسال طلبك للدعم، يرجى الانتظار للمراجعة.");

  await ctx.telegram.sendMessage(
    ADMIN_ID,
    `📬 طلب دعم جديد:\n\n📱 رقم الهاتف والمشكلة:\n${message}\n👤 من المستخدم: ${userId}`,
    Markup.inlineKeyboard([
      Markup.button.callback('✅ تأكيد الإرسال', `confirm_${userId}`),
      Markup.button.callback('❌ رفض الطلب', `deny_${userId}`)
    ])
  );
});

bot.action(/confirm_(\d+)/, async (ctx) => {
  const userId = ctx.match[1];
  const message = userRequests[userId] || '—';

  await ctx.editMessageText('✅ تم تأكيد إرسال الطلب.');

  // إرسال رسالة إلى المستخدم
  await ctx.telegram.sendMessage(userId, '📨 تم قبول طلبك وإرساله إلى الدعم ✅');

  // إرسال رسالة إلى Gmail
  await transporter.sendMail({
    from: '"Bot Support" <yourbot@gmail.com>',
    to: 'yourbot@gmail.com', // ← نفس الإيميل أو أي إيميل تاني
    subject: 'طلب دعم جديد',
    text: `تم استلام طلب دعم جديد من المستخدم: ${userId}\n\nالرسالة:\n${message}`
  }).then(() => {
    console.log('📧 تم إرسال الرسالة إلى Gmail');
  }).catch((error) => {
    console.error('❌ فشل في إرسال Gmail:', error.message);
  });

  // حذف الطلب من الذاكرة
  delete userRequests[userId];
});

bot.action(/deny_(\d+)/, async (ctx) => {
  const userId = ctx.match[1];
  await ctx.editMessageText('❌ تم رفض الطلب.');
  await ctx.telegram.sendMessage(userId, '❌ تم رفض طلبك من قبل الإدارة.');
  delete userRequests[userId];
});

bot.launch();
console.log("🤖 البوت شغال ✅ مع دعم Gmail");
