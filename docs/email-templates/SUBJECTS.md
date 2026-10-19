# Темы писем (Subject)

Вставляйте в поле **Subject heading** соответствующего шаблона.

## confirm-signup

```
{{ if eq .Data.ui_locale "ru" }}Подтвердите аккаунт YourHEI{{ else if eq .Data.ui_locale "ka" }}დაადასტურეთ თქვენი YourHEI ანგარიში{{ else if eq .Data.ui_locale "es" }}Confirma tu cuenta de YourHEI{{ else if eq .Data.ui_locale "zh" }}确认您的 YourHEI 账户{{ else if eq .Data.ui_locale "ar" }}أكّد حسابك في YourHEI{{ else if eq .Data.ui_locale "az" }}YourHEI hesabınızı təsdiqləyin{{ else if eq .Data.ui_locale "de" }}Bestätige dein YourHEI-Konto{{ else if eq .Data.ui_locale "fr" }}Confirmez votre compte YourHEI{{ else if eq .Data.ui_locale "hy" }}Հաստատեք ձեր YourHEI հաշիվը{{ else if eq .Data.ui_locale "kk" }}YourHEI аккаунтын растаңыз{{ else if eq .Data.ui_locale "ky" }}YourHEI аккаунтуңузду ырастаңыз{{ else if eq .Data.ui_locale "pl" }}Potwierdź konto w YourHEI{{ else if eq .Data.ui_locale "tr" }}YourHEI hesabını onayla{{ else if eq .Data.ui_locale "uk" }}Підтвердіть акаунт YourHEI{{ else if eq .Data.ui_locale "uz" }}YourHEI hisobingizni tasdiqlang{{ else }}Confirm your YourHEI account{{ end }}
```

## recovery

```
{{ if eq .Data.ui_locale "ru" }}Сброс пароля YourHEI{{ else if eq .Data.ui_locale "ka" }}YourHEI-ის პაროლის აღდგენა{{ else if eq .Data.ui_locale "es" }}Restablece tu contraseña de YourHEI{{ else if eq .Data.ui_locale "zh" }}重置您的 YourHEI 密码{{ else if eq .Data.ui_locale "ar" }}إعادة تعيين كلمة مرور YourHEI{{ else if eq .Data.ui_locale "az" }}YourHEI parolunu sıfırlayın{{ else if eq .Data.ui_locale "de" }}Passwort für YourHEI zurücksetzen{{ else if eq .Data.ui_locale "fr" }}Réinitialisez votre mot de passe YourHEI{{ else if eq .Data.ui_locale "hy" }}YourHEI-ի գաղտնաբառի վերականգնում{{ else if eq .Data.ui_locale "kk" }}YourHEI құпия сөзін қалпына келтіру{{ else if eq .Data.ui_locale "ky" }}YourHEI сырсөзүн калыбына келтирүү{{ else if eq .Data.ui_locale "pl" }}Zresetuj hasło do YourHEI{{ else if eq .Data.ui_locale "tr" }}YourHEI şifreni sıfırla{{ else if eq .Data.ui_locale "uk" }}Скидання пароля YourHEI{{ else if eq .Data.ui_locale "uz" }}YourHEI parolini tiklash{{ else }}Reset your YourHEI password{{ end }}
```

## email-change

```
{{ if eq .Data.ui_locale "ru" }}Подтвердите новую почту на YourHEI{{ else if eq .Data.ui_locale "ka" }}დაადასტურეთ ახალი ელფოსტა YourHEI-ზე{{ else if eq .Data.ui_locale "es" }}Confirma tu nuevo correo en YourHEI{{ else if eq .Data.ui_locale "zh" }}确认您在 YourHEI 的新邮箱{{ else if eq .Data.ui_locale "ar" }}أكّد بريدك الإلكتروني الجديد في YourHEI{{ else if eq .Data.ui_locale "az" }}YourHEI-də yeni e-poçtunuzu təsdiqləyin{{ else if eq .Data.ui_locale "de" }}Bestätige deine neue E-Mail bei YourHEI{{ else if eq .Data.ui_locale "fr" }}Confirmez votre nouvel e-mail sur YourHEI{{ else if eq .Data.ui_locale "hy" }}Հաստատեք նոր էլ. փոստը YourHEI-ում{{ else if eq .Data.ui_locale "kk" }}YourHEI-дегі жаңа поштаны растаңыз{{ else if eq .Data.ui_locale "ky" }}YourHEI’деги жаңы почтаңызды ырастаңыз{{ else if eq .Data.ui_locale "pl" }}Potwierdź nowy e-mail w YourHEI{{ else if eq .Data.ui_locale "tr" }}YourHEI’deki yeni e-postanı onayla{{ else if eq .Data.ui_locale "uk" }}Підтвердіть нову пошту на YourHEI{{ else if eq .Data.ui_locale "uz" }}YourHEI’dagi yangi pochtangizni tasdiqlang{{ else }}Confirm your new e-mail on YourHEI{{ end }}
```

## reauthentication

```
{{ if eq .Data.ui_locale "ru" }}Ваш код подтверждения YourHEI{{ else if eq .Data.ui_locale "ka" }}თქვენი YourHEI დადასტურების კოდი{{ else if eq .Data.ui_locale "es" }}Tu código de confirmación de YourHEI{{ else if eq .Data.ui_locale "zh" }}您的 YourHEI 验证码{{ else if eq .Data.ui_locale "ar" }}رمز التأكيد الخاص بك في YourHEI{{ else if eq .Data.ui_locale "az" }}YourHEI təsdiq kodunuz{{ else if eq .Data.ui_locale "de" }}Dein YourHEI-Bestätigungscode{{ else if eq .Data.ui_locale "fr" }}Votre code de confirmation YourHEI{{ else if eq .Data.ui_locale "hy" }}Ձեր YourHEI հաստատման կոդը{{ else if eq .Data.ui_locale "kk" }}YourHEI растау коды{{ else if eq .Data.ui_locale "ky" }}YourHEI ырастоо коду{{ else if eq .Data.ui_locale "pl" }}Twój kod potwierdzający YourHEI{{ else if eq .Data.ui_locale "tr" }}YourHEI onay kodun{{ else if eq .Data.ui_locale "uk" }}Ваш код підтвердження YourHEI{{ else if eq .Data.ui_locale "uz" }}YourHEI tasdiqlash kodingiz{{ else }}Your YourHEI confirmation code{{ end }}
```

