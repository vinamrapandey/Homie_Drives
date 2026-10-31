# Homie Drives — Production Deployment & DevOps Guide

* **Hosting Provider**: Vercel
* **Source Control**: GitHub (`https://github.com/vinamrapandey/Homie_Drives.git`)
* **Production Branch**: `main`

---

## 1. Vercel Project Setup (Web Dashboard)

Connecting Vercel directly to your GitHub repository establishes continuous integration, preview deployments, and automatic production releases.

1. Navigate to [vercel.com/new](https://vercel.com/new).
2. Click **Import** next to `vinamrapandey/Homie_Drives`.
3. In the project settings:
   * **Project Name**: `homie-drives`
   * **Framework Preset**: `Next.js`
   * **Root Directory**: `./`
   * **Build Command**: `npm run build`
   * **Output Directory**: `.next`
4. **Critical Security & Access Setting**:
   * Under **Project Settings → Deployment Protection**, ensure **Vercel Authentication is DISABLED** for the Production environment so that public customers in Delhi NCR can access the platform without being prompted for a Vercel login.
5. Click **Deploy**.

---

## 2. Production Build Verification Workflow

Before pushing code to `main`, run the local verification suite:

```bash
# 1. Strict TypeScript check
npx tsc --noEmit

# 2. ESLint linting
npm run lint

# 3. Production webpack compilation test
npm run build:webpack
```

---

## 3. Custom Domain Configuration (e.g., `homiedrives.in`)

When ready to connect a custom domain:
1. In the Vercel Dashboard, go to **Settings → Domains**.
2. Enter `homiedrives.in` and `www.homiedrives.in`.
3. Configure the provided DNS CNAME and A-records with your domain registrar.
4. Vercel will automatically provision and renew a free Let's Encrypt TLS certificate.

