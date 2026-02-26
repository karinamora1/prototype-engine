# Git push not working – fix checklist

Your remote is: `https://github.com/karinamora1/Prototype-Engine.git`

---

## "Invalid username or token" / Never prompted for password

GitHub **no longer accepts your account password** for Git. You must use a **Personal Access Token**, and Git must **ask** you for it. If you're never prompted, macOS is using an old or invalid stored credential.

### Step 1: Create a Personal Access Token

1. Open: **https://github.com/settings/tokens**
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Note: e.g. `BOI Prototype`  
   Expiration: your choice (e.g. 90 days)  
   Scopes: check **repo**
4. Click **"Generate token"**
5. **Copy the token** (starts with `ghp_...`) and save it somewhere safe—you won’t see it again.

### Step 2: Clear the stored GitHub credential (so Git will prompt you)

**Option A – Keychain Access (recommended if Terminal erase didn’t work)**

1. Open **Keychain Access** (Spotlight: press ⌘+Space, type “Keychain Access”, press Enter).
2. In the left sidebar, select **“login”** (under “Keychains”) and **“Passwords”** (under “Category”) if needed.
3. In the search box (top right), type **`github`**.
4. Find an entry whose name is **`github.com`** (or “GitHub” / “github.com” in the “Name” column).
5. Double‑click it (or select it and press Enter). In the window that opens, check **“Show password”** and confirm with your Mac password if asked.
6. **Delete the entry:** right‑click the `github.com` item in the list → **Delete “github.com”** (or select it and press Delete). Confirm.
7. Close Keychain Access.

**Option B – Terminal (if Option A is not possible)**

In Terminal, run:

```bash
git credential-osxkeychain erase
```

Then type exactly these three lines and press **Enter** after the last one:

```
protocol=https
host=github.com
```

Press **Enter** again (empty line). You should see no output—that’s OK.

### Step 3: Push again

```bash
cd "/Users/karinamora/Documents/BOI Prototype"
git push -u origin main
```

You should now be prompted:

- **Username for 'https://github.com':** type `karinamora1`
- **Password for 'https://karinamora1@github.com':** paste your **token** (the `ghp_...` string), not your GitHub password

After that, the push should succeed and macOS may save the token so you aren’t asked every time.

---

## 1. Repo under an organization?

If you created **Prototype-Engine** under an organization (e.g. Board of Innovation), the URL is different.

- Check in the browser: open the repo and look at the top. Does it say `karinamora1 / Prototype-Engine` or `YourOrg / Prototype-Engine`?
- If it’s under an org, run (replace `YOUR_ORG` with the org slug):
  ```bash
  git remote set-url origin https://github.com/YOUR_ORG/Prototype-Engine.git
  git push -u origin main
  ```

## 2. Use a Personal Access Token (recommended)

GitHub often rejects account passwords; a token is more reliable.

1. Go to: https://github.com/settings/tokens
2. **Generate new token (classic)**
3. Name it (e.g. "BOI Prototype"), set expiration, check **repo**
4. Generate and **copy the token** (you won’t see it again)
5. In Terminal:
   ```bash
   cd "/Users/karinamora/Documents/BOI Prototype"
   git push -u origin main
   ```
6. When it asks for **Username**: `karinamora1`  
   When it asks for **Password**: paste the **token** (not your GitHub password)

## 3. Try SSH instead of HTTPS

If you have an SSH key added to GitHub:

```bash
cd "/Users/karinamora/Documents/BOI Prototype"
git remote set-url origin git@github.com:karinamora1/Prototype-Engine.git
git push -u origin main
```

(If the repo is under an org, use `git@github.com:YOUR_ORG/Prototype-Engine.git`.)

## 4. Create the repo if it doesn’t exist

If you never created the repo or deleted it:

1. Go to https://github.com/new
2. Repository name: **Prototype-Engine** (exactly)
3. Choose Public or Private
4. Do **not** add README, .gitignore, or license
5. Click **Create repository**
6. Then run:
   ```bash
   cd "/Users/karinamora/Documents/BOI Prototype"
   git push -u origin main
   ```

## 5. What error do you see?

- **"Repository not found"** → Usually wrong URL (e.g. org vs user) or not logged in / no access. Use the correct remote (step 1) and a token (step 2).
- **"Authentication failed"** or **"Support for password authentication was removed"** → You must use a Personal Access Token (step 2) or SSH (step 3).
- **"failed to push some refs"** / **"updates were rejected"** → Someone else pushed first, or the remote has commits you don’t have. Run: `git pull origin main --rebase` then `git push -u origin main`.
