// Builds the e-mail templates for Supabase (Authentication -> Emails -> Templates) in 16 languages.
// One template per kind: the language is chosen with {{ .Data.ui_locale }}, which the registration form saves in the
// account (an account without it gets English). Run: node scripts/make-email-templates.mjs  ->  docs/email-templates/*.html
// The texts are machine translations: have a native speaker read them before many people get them.
import { mkdirSync, writeFileSync } from 'node:fs';

// For every language: dir, then [subject, title, text, button, ignore-note] for confirm / recovery / change,
// and [subject, title, text, ignore-note] for reauth (a code, no button).
const T = {
  en: { dir: 'ltr',
    confirm: ['Confirm your YourHEI account', 'Confirm your e-mail', 'Press the button to finish registration on YourHEI.', 'Confirm e-mail', 'If you did not register, just ignore this e-mail.'],
    recovery: ['Reset your YourHEI password', 'Reset your password', 'Press the button to choose a new password. The link works for one hour.', 'Choose a new password', 'If you did not ask for this, ignore this e-mail: your password stays the same.'],
    change: ['Confirm your new e-mail on YourHEI', 'Confirm your new e-mail', 'Press the button to use this address for your YourHEI account.', 'Confirm new e-mail', 'If you did not ask for this, ignore this e-mail.'],
    reauth: ['Your YourHEI confirmation code', 'Confirmation code', 'Enter this code on the site to confirm the action:', 'If you did not ask for this, ignore this e-mail.'] },
  ru: { dir: 'ltr',
    confirm: ['Подтвердите аккаунт YourHEI', 'Подтвердите почту', 'Нажмите кнопку, чтобы завершить регистрацию на YourHEI.', 'Подтвердить почту', 'Если вы не регистрировались, просто проигнорируйте это письмо.'],
    recovery: ['Сброс пароля YourHEI', 'Сброс пароля', 'Нажмите кнопку, чтобы выбрать новый пароль. Ссылка действует один час.', 'Выбрать новый пароль', 'Если вы этого не просили, проигнорируйте письмо: пароль останется прежним.'],
    change: ['Подтвердите новую почту на YourHEI', 'Подтвердите новую почту', 'Нажмите кнопку, чтобы использовать этот адрес для аккаунта YourHEI.', 'Подтвердить новую почту', 'Если вы этого не просили, проигнорируйте письмо.'],
    reauth: ['Ваш код подтверждения YourHEI', 'Код подтверждения', 'Введите этот код на сайте, чтобы подтвердить действие:', 'Если вы этого не просили, проигнорируйте письмо.'] },
  ka: { dir: 'ltr',
    confirm: ['დაადასტურეთ თქვენი YourHEI ანგარიში', 'დაადასტურეთ ელფოსტა', 'დააჭირეთ ღილაკს, რომ დაასრულოთ რეგისტრაცია YourHEI-ზე.', 'ელფოსტის დადასტურება', 'თუ არ დარეგისტრირებულხართ, უბრალოდ უგულებელყავით ეს წერილი.'],
    recovery: ['YourHEI-ის პაროლის აღდგენა', 'პაროლის აღდგენა', 'დააჭირეთ ღილაკს ახალი პაროლის ასარჩევად. ბმული მოქმედებს ერთი საათი.', 'ახალი პაროლის არჩევა', 'თუ ეს თქვენ არ მოგითხოვიათ, უგულებელყავით წერილი: პაროლი არ შეიცვლება.'],
    change: ['დაადასტურეთ ახალი ელფოსტა YourHEI-ზე', 'დაადასტურეთ ახალი ელფოსტა', 'დააჭირეთ ღილაკს, რომ ეს მისამართი გამოიყენოთ YourHEI ანგარიშისთვის.', 'ახალი ელფოსტის დადასტურება', 'თუ ეს თქვენ არ მოგითხოვიათ, უგულებელყავით წერილი.'],
    reauth: ['თქვენი YourHEI დადასტურების კოდი', 'დადასტურების კოდი', 'შეიყვანეთ ეს კოდი საიტზე მოქმედების დასადასტურებლად:', 'თუ ეს თქვენ არ მოგითხოვიათ, უგულებელყავით წერილი.'] },
  es: { dir: 'ltr',
    confirm: ['Confirma tu cuenta de YourHEI', 'Confirma tu correo', 'Pulsa el botón para terminar el registro en YourHEI.', 'Confirmar correo', 'Si no te has registrado, ignora este mensaje.'],
    recovery: ['Restablece tu contraseña de YourHEI', 'Restablecer contraseña', 'Pulsa el botón para elegir una contraseña nueva. El enlace funciona durante una hora.', 'Elegir contraseña nueva', 'Si no lo has pedido, ignora este mensaje: tu contraseña no cambiará.'],
    change: ['Confirma tu nuevo correo en YourHEI', 'Confirma tu nuevo correo', 'Pulsa el botón para usar esta dirección en tu cuenta de YourHEI.', 'Confirmar nuevo correo', 'Si no lo has pedido, ignora este mensaje.'],
    reauth: ['Tu código de confirmación de YourHEI', 'Código de confirmación', 'Introduce este código en el sitio para confirmar la acción:', 'Si no lo has pedido, ignora este mensaje.'] },
  zh: { dir: 'ltr',
    confirm: ['确认您的 YourHEI 账户', '确认您的邮箱', '点击按钮完成 YourHEI 的注册。', '确认邮箱', '如果您没有注册，请忽略此邮件。'],
    recovery: ['重置您的 YourHEI 密码', '重置密码', '点击按钮设置新密码。链接一小时内有效。', '设置新密码', '如果不是您本人操作，请忽略此邮件，密码不会改变。'],
    change: ['确认您在 YourHEI 的新邮箱', '确认新邮箱', '点击按钮，将此地址用于您的 YourHEI 账户。', '确认新邮箱', '如果不是您本人操作，请忽略此邮件。'],
    reauth: ['您的 YourHEI 验证码', '验证码', '请在网站上输入此验证码以确认操作：', '如果不是您本人操作，请忽略此邮件。'] },
  ar: { dir: 'rtl',
    confirm: ['أكّد حسابك في YourHEI', 'أكّد بريدك الإلكتروني', 'اضغط على الزر لإكمال التسجيل في YourHEI.', 'تأكيد البريد الإلكتروني', 'إذا لم تقم بالتسجيل، تجاهل هذه الرسالة.'],
    recovery: ['إعادة تعيين كلمة مرور YourHEI', 'إعادة تعيين كلمة المرور', 'اضغط على الزر لاختيار كلمة مرور جديدة. الرابط صالح لمدة ساعة.', 'اختيار كلمة مرور جديدة', 'إذا لم تطلب ذلك، تجاهل هذه الرسالة: ستبقى كلمة المرور كما هي.'],
    change: ['أكّد بريدك الإلكتروني الجديد في YourHEI', 'أكّد بريدك الجديد', 'اضغط على الزر لاستخدام هذا العنوان لحسابك في YourHEI.', 'تأكيد البريد الجديد', 'إذا لم تطلب ذلك، تجاهل هذه الرسالة.'],
    reauth: ['رمز التأكيد الخاص بك في YourHEI', 'رمز التأكيد', 'أدخل هذا الرمز في الموقع لتأكيد الإجراء:', 'إذا لم تطلب ذلك، تجاهل هذه الرسالة.'] },
  az: { dir: 'ltr',
    confirm: ['YourHEI hesabınızı təsdiqləyin', 'E-poçtunuzu təsdiqləyin', 'YourHEI-də qeydiyyatı tamamlamaq üçün düyməyə basın.', 'E-poçtu təsdiqlə', 'Qeydiyyatdan keçməmisinizsə, bu məktubu nəzərə almayın.'],
    recovery: ['YourHEI parolunu sıfırlayın', 'Parolu sıfırlayın', 'Yeni parol seçmək üçün düyməyə basın. Keçid bir saat işləyir.', 'Yeni parol seç', 'Bunu siz istəməmisinizsə, məktubu nəzərə almayın: parolunuz dəyişməyəcək.'],
    change: ['YourHEI-də yeni e-poçtunuzu təsdiqləyin', 'Yeni e-poçtu təsdiqləyin', 'Bu ünvanı YourHEI hesabınız üçün istifadə etmək üçün düyməyə basın.', 'Yeni e-poçtu təsdiqlə', 'Bunu siz istəməmisinizsə, məktubu nəzərə almayın.'],
    reauth: ['YourHEI təsdiq kodunuz', 'Təsdiq kodu', 'Əməliyyatı təsdiqləmək üçün bu kodu saytda daxil edin:', 'Bunu siz istəməmisinizsə, məktubu nəzərə almayın.'] },
  de: { dir: 'ltr',
    confirm: ['Bestätige dein YourHEI-Konto', 'Bestätige deine E-Mail', 'Klicke auf den Button, um die Registrierung bei YourHEI abzuschließen.', 'E-Mail bestätigen', 'Wenn du dich nicht registriert hast, ignoriere diese E-Mail.'],
    recovery: ['Passwort für YourHEI zurücksetzen', 'Passwort zurücksetzen', 'Klicke auf den Button, um ein neues Passwort zu wählen. Der Link gilt eine Stunde.', 'Neues Passwort wählen', 'Wenn du das nicht angefordert hast, ignoriere diese E-Mail: Dein Passwort bleibt unverändert.'],
    change: ['Bestätige deine neue E-Mail bei YourHEI', 'Bestätige deine neue E-Mail', 'Klicke auf den Button, um diese Adresse für dein YourHEI-Konto zu verwenden.', 'Neue E-Mail bestätigen', 'Wenn du das nicht angefordert hast, ignoriere diese E-Mail.'],
    reauth: ['Dein YourHEI-Bestätigungscode', 'Bestätigungscode', 'Gib diesen Code auf der Website ein, um die Aktion zu bestätigen:', 'Wenn du das nicht angefordert hast, ignoriere diese E-Mail.'] },
  fr: { dir: 'ltr',
    confirm: ['Confirmez votre compte YourHEI', 'Confirmez votre e-mail', 'Cliquez sur le bouton pour terminer votre inscription sur YourHEI.', 'Confirmer l’e-mail', 'Si vous ne vous êtes pas inscrit, ignorez ce message.'],
    recovery: ['Réinitialisez votre mot de passe YourHEI', 'Réinitialiser le mot de passe', 'Cliquez sur le bouton pour choisir un nouveau mot de passe. Le lien est valable une heure.', 'Choisir un nouveau mot de passe', 'Si vous n’êtes pas à l’origine de cette demande, ignorez ce message : votre mot de passe ne change pas.'],
    change: ['Confirmez votre nouvel e-mail sur YourHEI', 'Confirmez votre nouvel e-mail', 'Cliquez sur le bouton pour utiliser cette adresse pour votre compte YourHEI.', 'Confirmer le nouvel e-mail', 'Si vous n’êtes pas à l’origine de cette demande, ignorez ce message.'],
    reauth: ['Votre code de confirmation YourHEI', 'Code de confirmation', 'Saisissez ce code sur le site pour confirmer l’action :', 'Si vous n’êtes pas à l’origine de cette demande, ignorez ce message.'] },
  hy: { dir: 'ltr',
    confirm: ['Հաստատեք ձեր YourHEI հաշիվը', 'Հաստատեք էլ. փոստը', 'Սեղմեք կոճակը՝ YourHEI-ում գրանցումն ավարտելու համար։', 'Հաստատել էլ. փոստը', 'Եթե դուք չեք գրանցվել, պարզապես անտեսեք այս նամակը։'],
    recovery: ['YourHEI-ի գաղտնաբառի վերականգնում', 'Գաղտնաբառի վերականգնում', 'Սեղմեք կոճակը՝ նոր գաղտնաբառ ընտրելու համար։ Հղումը գործում է մեկ ժամ։', 'Ընտրել նոր գաղտնաբառ', 'Եթե դուք սա չեք պահանջել, անտեսեք նամակը․ գաղտնաբառը չի փոխվի։'],
    change: ['Հաստատեք նոր էլ. փոստը YourHEI-ում', 'Հաստատեք նոր էլ. փոստը', 'Սեղմեք կոճակը՝ այս հասցեն YourHEI հաշվի համար օգտագործելու համար։', 'Հաստատել նոր էլ. փոստը', 'Եթե դուք սա չեք պահանջել, անտեսեք նամակը։'],
    reauth: ['Ձեր YourHEI հաստատման կոդը', 'Հաստատման կոդ', 'Մուտքագրեք այս կոդը կայքում՝ գործողությունը հաստատելու համար․', 'Եթե դուք սա չեք պահանջել, անտեսեք նամակը։'] },
  kk: { dir: 'ltr',
    confirm: ['YourHEI аккаунтын растаңыз', 'Поштаңызды растаңыз', 'YourHEI-дегі тіркелуді аяқтау үшін батырманы басыңыз.', 'Поштаны растау', 'Егер сіз тіркелмеген болсаңыз, бұл хатқа назар аудармаңыз.'],
    recovery: ['YourHEI құпия сөзін қалпына келтіру', 'Құпия сөзді қалпына келтіру', 'Жаңа құпия сөзді таңдау үшін батырманы басыңыз. Сілтеме бір сағат жарамды.', 'Жаңа құпия сөзді таңдау', 'Егер мұны сіз сұрамаған болсаңыз, хатқа назар аудармаңыз: құпия сөз өзгермейді.'],
    change: ['YourHEI-дегі жаңа поштаны растаңыз', 'Жаңа поштаны растаңыз', 'Бұл мекенжайды YourHEI аккаунты үшін қолдану үшін батырманы басыңыз.', 'Жаңа поштаны растау', 'Егер мұны сіз сұрамаған болсаңыз, хатқа назар аудармаңыз.'],
    reauth: ['YourHEI растау коды', 'Растау коды', 'Әрекетті растау үшін бұл кодты сайтқа енгізіңіз:', 'Егер мұны сіз сұрамаған болсаңыз, хатқа назар аудармаңыз.'] },
  ky: { dir: 'ltr',
    confirm: ['YourHEI аккаунтуңузду ырастаңыз', 'Почтаңызды ырастаңыз', 'YourHEI’де катталууну аяктоо үчүн баскычты басыңыз.', 'Почтаны ырастоо', 'Эгер сиз катталбаган болсоңуз, бул катты көңүлгө албаңыз.'],
    recovery: ['YourHEI сырсөзүн калыбына келтирүү', 'Сырсөздү калыбына келтирүү', 'Жаңы сырсөздү тандоо үчүн баскычты басыңыз. Шилтеме бир саат иштейт.', 'Жаңы сырсөздү тандоо', 'Эгер муну сиз сураган болбосоңуз, катты көңүлгө албаңыз: сырсөз өзгөрбөйт.'],
    change: ['YourHEI’деги жаңы почтаңызды ырастаңыз', 'Жаңы почтаны ырастаңыз', 'Бул даректи YourHEI аккаунтуңуз үчүн колдонуу үчүн баскычты басыңыз.', 'Жаңы почтаны ырастоо', 'Эгер муну сиз сураган болбосоңуз, катты көңүлгө албаңыз.'],
    reauth: ['YourHEI ырастоо коду', 'Ырастоо коду', 'Аракетти ырастоо үчүн бул кодду сайтка киргизиңиз:', 'Эгер муну сиз сураган болбосоңуз, катты көңүлгө албаңыз.'] },
  pl: { dir: 'ltr',
    confirm: ['Potwierdź konto w YourHEI', 'Potwierdź swój e-mail', 'Kliknij przycisk, aby dokończyć rejestrację w YourHEI.', 'Potwierdź e-mail', 'Jeśli to nie ty się rejestrowałeś, zignoruj tę wiadomość.'],
    recovery: ['Zresetuj hasło do YourHEI', 'Zresetuj hasło', 'Kliknij przycisk, aby wybrać nowe hasło. Link działa przez godzinę.', 'Wybierz nowe hasło', 'Jeśli to nie ty o to prosiłeś, zignoruj tę wiadomość: hasło się nie zmieni.'],
    change: ['Potwierdź nowy e-mail w YourHEI', 'Potwierdź nowy e-mail', 'Kliknij przycisk, aby używać tego adresu w koncie YourHEI.', 'Potwierdź nowy e-mail', 'Jeśli to nie ty o to prosiłeś, zignoruj tę wiadomość.'],
    reauth: ['Twój kod potwierdzający YourHEI', 'Kod potwierdzający', 'Wpisz ten kod na stronie, aby potwierdzić działanie:', 'Jeśli to nie ty o to prosiłeś, zignoruj tę wiadomość.'] },
  tr: { dir: 'ltr',
    confirm: ['YourHEI hesabını onayla', 'E-postanı onayla', 'YourHEI kaydını tamamlamak için düğmeye bas.', 'E-postayı onayla', 'Kayıt olmadıysan bu e-postayı yok say.'],
    recovery: ['YourHEI şifreni sıfırla', 'Şifreni sıfırla', 'Yeni bir şifre seçmek için düğmeye bas. Bağlantı bir saat geçerlidir.', 'Yeni şifre seç', 'Bunu sen istemediysen bu e-postayı yok say: şifren değişmez.'],
    change: ['YourHEI’deki yeni e-postanı onayla', 'Yeni e-postanı onayla', 'Bu adresi YourHEI hesabın için kullanmak üzere düğmeye bas.', 'Yeni e-postayı onayla', 'Bunu sen istemediysen bu e-postayı yok say.'],
    reauth: ['YourHEI onay kodun', 'Onay kodu', 'İşlemi onaylamak için bu kodu sitede gir:', 'Bunu sen istemediysen bu e-postayı yok say.'] },
  uk: { dir: 'ltr',
    confirm: ['Підтвердіть акаунт YourHEI', 'Підтвердіть пошту', 'Натисніть кнопку, щоб завершити реєстрацію на YourHEI.', 'Підтвердити пошту', 'Якщо ви не реєструвалися, просто проігноруйте цей лист.'],
    recovery: ['Скидання пароля YourHEI', 'Скидання пароля', 'Натисніть кнопку, щоб обрати новий пароль. Посилання діє одну годину.', 'Обрати новий пароль', 'Якщо ви цього не просили, проігноруйте лист: пароль залишиться попереднім.'],
    change: ['Підтвердіть нову пошту на YourHEI', 'Підтвердіть нову пошту', 'Натисніть кнопку, щоб використовувати цю адресу для акаунта YourHEI.', 'Підтвердити нову пошту', 'Якщо ви цього не просили, проігноруйте лист.'],
    reauth: ['Ваш код підтвердження YourHEI', 'Код підтвердження', 'Введіть цей код на сайті, щоб підтвердити дію:', 'Якщо ви цього не просили, проігноруйте лист.'] },
  uz: { dir: 'ltr',
    confirm: ['YourHEI hisobingizni tasdiqlang', 'Elektron pochtangizni tasdiqlang', 'YourHEI’da ro‘yxatdan o‘tishni yakunlash uchun tugmani bosing.', 'Pochtani tasdiqlash', 'Agar ro‘yxatdan o‘tmagan bo‘lsangiz, bu xatni e’tiborsiz qoldiring.'],
    recovery: ['YourHEI parolini tiklash', 'Parolni tiklash', 'Yangi parol tanlash uchun tugmani bosing. Havola bir soat amal qiladi.', 'Yangi parol tanlash', 'Buni siz so‘ramagan bo‘lsangiz, xatni e’tiborsiz qoldiring: parolingiz o‘zgarmaydi.'],
    change: ['YourHEI’dagi yangi pochtangizni tasdiqlang', 'Yangi pochtani tasdiqlang', 'Bu manzilni YourHEI hisobingiz uchun ishlatish uchun tugmani bosing.', 'Yangi pochtani tasdiqlash', 'Buni siz so‘ramagan bo‘lsangiz, xatni e’tiborsiz qoldiring.'],
    reauth: ['YourHEI tasdiqlash kodingiz', 'Tasdiqlash kodi', 'Amalni tasdiqlash uchun ushbu kodni saytga kiriting:', 'Buni siz so‘ramagan bo‘lsangiz, xatni e’tiborsiz qoldiring.'] },
};

const LOCALES = Object.keys(T);
const FALLBACK = 'en';

/** A Go-template switch over the language: {{ if eq .Data.ui_locale "ru" }}...{{ else if ... }}...{{ else }}English{{ end }} */
function pick(render) {
  const others = LOCALES.filter((l) => l !== FALLBACK);
  let out = '';
  others.forEach((l, i) => {
    out += `{{ ${i === 0 ? 'if' : 'else if'} eq .Data.ui_locale "${l}" }}${render(l)}`;
  });
  return `${out}{{ else }}${render(FALLBACK)}{{ end }}`;
}

function wrap(body) {
  return `<!doctype html>
<html dir="${pick((l) => T[l].dir)}">
<body style="margin:0;padding:0;background:#f4f6f5;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f5;padding:24px 12px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border:1px solid #d5dcd8;">
<tr><td dir="ltr" style="background:#0a1a16;padding:20px 28px;font-family:Georgia,'Times New Roman',serif;font-size:26px;color:#f1efe6;letter-spacing:0.5px;">YourHEI<span style="color:#e7b94b;"> &#9632;</span></td></tr>
<tr><td style="padding:28px;font-family:Arial,Helvetica,sans-serif;color:#0f2d26;font-size:16px;line-height:1.55;">
${body}
</td></tr>
<tr><td dir="ltr" style="padding:16px 28px;border-top:1px solid #e3e8e5;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#5b6e68;">yourhei.com</td></tr>
</table>
</td></tr>
</table>
</body>
</html>
`;
}

const button = (label) =>
  `<p style="margin:24px 0;"><a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#0f2d26;color:#ffffff;text-decoration:none;padding:13px 24px;font-weight:bold;">${label}</a></p>
<p dir="ltr" style="font-size:13px;color:#5b6e68;word-break:break-all;"><a href="{{ .ConfirmationURL }}" style="color:#5b6e68;">{{ .ConfirmationURL }}</a></p>`;

function linkTemplate(key) {
  return wrap(`<h1 style="margin:0 0 12px;font-size:22px;font-weight:bold;">${pick((l) => T[l][key][1])}</h1>
<p style="margin:0;">${pick((l) => T[l][key][2])}</p>
${button(pick((l) => T[l][key][3]))}
<p style="margin:0;font-size:14px;color:#5b6e68;">${pick((l) => T[l][key][4])}</p>`);
}

function codeTemplate() {
  return wrap(`<h1 style="margin:0 0 12px;font-size:22px;font-weight:bold;">${pick((l) => T[l].reauth[1])}</h1>
<p style="margin:0;">${pick((l) => T[l].reauth[2])}</p>
<p dir="ltr" style="margin:24px 0;font-size:32px;letter-spacing:6px;font-weight:bold;font-family:'Courier New',monospace;">{{ .Token }}</p>
<p style="margin:0;font-size:14px;color:#5b6e68;">${pick((l) => T[l].reauth[3])}</p>`);
}

mkdirSync('docs/email-templates', { recursive: true });
const files = {
  'confirm-signup.html': linkTemplate('confirm'),
  'recovery.html': linkTemplate('recovery'),
  'email-change.html': linkTemplate('change'),
  'reauthentication.html': codeTemplate(),
};
for (const [name, html] of Object.entries(files)) writeFileSync(`docs/email-templates/${name}`, html);

const subjects = { 'confirm-signup': 'confirm', recovery: 'recovery', 'email-change': 'change', reauthentication: 'reauth' };
let md = '# Темы писем (Subject)\n\nВставляйте в поле **Subject heading** соответствующего шаблона.\n\n';
for (const [file, key] of Object.entries(subjects)) md += `## ${file}\n\n\`\`\`\n${pick((l) => T[l][key][0])}\n\`\`\`\n\n`;
writeFileSync('docs/email-templates/SUBJECTS.md', md);
console.log('written:', Object.keys(files).join(', '), '+ SUBJECTS.md');
