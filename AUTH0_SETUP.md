# Auth0 Setup Guide

## Důležité nastavení pro změnu hesla

Pro správnou funkci "Změnit heslo" je potřeba nakonfigurovat Auth0 Dashboard:

### 1. Email Provider

Auth0 potřebuje email provider pro odesílání emailů:

**Cesta:** [Auth0 Dashboard > Branding > Email Provider](https://manage.auth0.com/#/emails/provider)

**Možnosti:**
- **Auth0 Built-in** (výchozí, limitované na 10 emailů/den)
- **SendGrid** (doporučeno pro produkci)
- **Mandrill**
- **Amazon SES**
- **Custom SMTP**

**Doporučení pro produkci:**
```
Provider: SendGrid
API Key: [váš SendGrid API key]
```

### 2. Email Template - Change Password

**Cesta:** [Auth0 Dashboard > Branding > Email Templates](https://manage.auth0.com/#/emails)

1. Vyberte **Change Password** template
2. Zapněte template (Enable)
3. Upravte template podle potřeby (volitelné)

**Výchozí template obsahuje:**
- Link na reset hesla
- Platnost linku (obvykle 5 dní)
- Tlačítko "Change Password"

### 3. Database Connection

**Cesta:** [Auth0 Dashboard > Authentication > Database](https://manage.auth0.com/#/connections/database)

Ujistěte se, že máte vytvořenou **Database Connection** s názvem:
- `Username-Password-Authentication` (standardní)

**Nastavení:**
- ✓ Enabled
- ✓ Password Policy: Fair (nebo vyšší)
- ✓ Disable Sign Ups: podle potřeby

### 4. OAuth vs Database Users

**Důležité rozlišení:**

| Typ přihlášení | Změna hesla | Poznámka |
|----------------|-------------|----------|
| Email + Heslo (Database) | ✓ Funguje | Reset přes Auth0 email |
| Google OAuth | ✗ Nefunguje | Heslo je u Google |
| GitHub OAuth | ✗ Nefunguje | Heslo je u GitHub |

Pro OAuth uživatele aplikace zobrazí: *"Přihlásili jste se přes Google/GitHub. Heslo změníte v nastavení vašeho Google/GitHub účtu."*

## Testing

### Test Database User Password Reset:

1. Vytvořte testovacího uživatele s email + heslo
2. Přihlaste se
3. Klikněte na avatar → "Změnit heslo"
4. Zkontrolujte inbox (i SPAM)
5. Klikněte na link v emailu
6. Nastavte nové heslo

### Troubleshooting:

**Email nedorazil:**
- ✓ Zkontrolujte SPAM složku
- ✓ Ověřte Email Provider v Dashboard
- ✓ Zkontrolujte logs: Dashboard > Monitoring > Logs
- ✓ Built-in provider má limit 10 emailů/den
- ✓ Zkontrolujte že template je Enable

**Chyba "connection not found":**
- ✓ Ověřte název connection: `Username-Password-Authentication`
- ✓ Zkontrolujte že je connection enabled
- ✓ Zkontrolujte že je connection přiřazená k vaší aplikaci

**OAuth user error:**
- ✓ Normální chování - OAuth users nemají heslo v Auth0
- ✓ Aplikace to správně detekuje a zobrazí info message

## Production Checklist

- [ ] Nakonfigurován Email Provider (ne built-in)
- [ ] Change Password template je Enable
- [ ] Password Policy nastavena (min. Fair)
- [ ] Tested s real user
- [ ] SMTP credentials jsou v environment variables
- [ ] Email "From" adresa je ověřená

## Reference

- [Auth0 Database Connections](https://auth0.com/docs/authenticate/database-connections)
- [Auth0 Email Provider Setup](https://auth0.com/docs/customize/email/email-templates)
- [Auth0 Password Reset](https://auth0.com/docs/authenticate/database-connections/password-change)

