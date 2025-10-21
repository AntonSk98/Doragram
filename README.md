# 🐾 Welcome to **Doragram!**

Doragram is an Android application with one simple mission — **to help you save time!**

How often have you caught yourself endlessly scrolling through Reels or suggested videos on Instagram instead of doing something meaningful? Since Instagram doesn’t offer a way to disable these distractions, the idea for Doragram was born. Instead of Reels or Explore feeds, Doragram replaces those sections with charming, cartoon-like pictures of our beloved dog **Dora**. 🐶

---

## 📲 How to Install
Download and install the `doragram.apk` file located here:  
👉 [Download Doragram](release/doragram.apk)

---

## 🌼 How to Use

When you start Doragram, you’ll be greeted by Dora sitting peacefully in her garden.  
If you feel like relaxing for a bit, you can pop the little bubbles with Dora’s face that appear around her. 😄

![Dora chilling in the garden](/expose/welcome_page.png "Dora - your productivity buddy 🐾")

Once you tap on the seated Dora, Instagram will load — but with a twist:

- The **Reels** and **Explore** tabs are disabled.  
- Even if someone shares a reel link with you, it won’t open.  
- You still have full access to **your profile** and **conversations**, but that’s it.

Everything is designed to help you value your time while keeping essential features intact.

![Doragram main page](/expose/doragram_main_page.jpg)
---

## ⏰ Still Feel Like Procrastinating?

Totally understandable — we’ve all been there!  
If you *really* want to browse Instagram as usual, tap Dora’s image **20 times** to activate **Procrastination Mode**.  

In this mode:
- Instagram opens in its original form (no tweaks or restrictions).  
- The mode lasts only **5 minutes**.  
- After that, Instagram automatically closes, and you’ll find yourself back with Dora in her sunny garden. 🌞

![Activating procrastination mode](/expose/activate_procrastination.jpg)

![Procrastination mode activated](/expose/procrastination_welcome_modal.jpg)

![Procrastination mode main page](/expose/procrastination_page.png)


---

## 🧠 For the Curious (and Nerds)

### ⚙️ How It Works
When you tap Dora, the app opens an internal browser that loads the **desktop version of Instagram**.  
Doragram then injects custom **JavaScript** and **CSS** at runtime to hide unnecessary sections like Reels, Explore, and suggestions.

### 🔒 Is It Secure?
Absolutely. Doragram doesn’t store or transmit any personal data.  
There’s **no backend** — everything runs locally on your device.

---

## 💻 For Developers

### 🧩 Framework
Doragram is built using the **[Capacitor](https://capacitorjs.com/)** framework.  
The Instagram interface is loaded using **[cordova-plugin-inappbrowser](https://github.com/apache/cordova-plugin-inappbrowser)**.

### 🗂 Directory Structure

The main web app source lives in 👉 [this](/dist/) directory.  
Here you can adjust the source files.

After making changes, run:

```bash
npx cap sync
```

Then open the project in Android Studio and run it on your device or emulator.
More info here: [Capacitor Android Docs](https://capacitorjs.com/docs/android)

### 🧿 Generating App Icons
To generate icons or splash screens:
1. Place your image in the [resources](/resources/) folder.
2. Run:
``` bash
npx capacitor-assets generate
```
More details: [Capacitor Assets Guide](https://capacitorjs.com/docs/guides/splash-screens-and-icons)

## ⚠️ Note
Doragram relies on the desktop web version of Instagram, which comes with its natural limitations compared to the mobile app.

### Made with ❤️ and a lot of Dora’s charm. Stay focused — Dora believes in you! 🐕✨