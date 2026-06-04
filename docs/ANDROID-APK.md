# Android APK (testavimui kol vyksta darbai)

AETERNA Android programėlė — **WebView** apvalkalas, kuris atidaro jūsų **Next.js dev serverį** telefone. Testuokite profilį `/m/ona-demo` be pilno deploy.

## Kas reikia

- [Android Studio](https://developer.android.com/studio) (SDK + JDK 17)
- Kompiuteryje veikiantys `api` ir `web`
- Telefonas ir PC **tame pačiame Wi‑Fi** (arba Android emuliatorius)

## 1. Paleiskite backend ir frontend LAN režimu

**API** (terminalas 1):

```powershell
cd api
npm run dev
```

**Web** — būtina klausyti visų tinklo sąsajų (terminalas 2):

```powershell
cd web
npm run dev:lan
```

`dev:lan` = `next dev -H 0.0.0.0` (prieinama iš telefono).

**API adresas telefonui** — `web/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://JŪSŲ_PC_IP:4000
```

PC IP (PowerShell): `ipconfig` → IPv4 (pvz. `192.168.1.42`).

## 2. Nustatykite URL prieš build (nebūtina, jei keisite programėlėje)

Redaguokite `android/gradle.properties`:

```properties
WEB_APP_URL=http://192.168.1.42:3000
```

- **Fizinis telefonas:** `http://JŪSŲ_PC_IP:3000`
- **Emuliatorius:** `http://10.0.2.2:3000` (10.0.2.2 = host PC)

## 3. Surinkite APK

### Variantas A — Android Studio (paprasčiausia)

1. Android Studio → **Open** → aplankas `unmute/android`
2. Palaukite Gradle sync
3. **Build → Build Bundle(s) / APK(s) → Build APK(s)**
4. APK: `android/app/build/outputs/apk/debug/app-debug.apk`

### Variantas B — PowerShell

Jei yra `gradlew.bat`:

```powershell
cd android
.\build-apk.ps1
```

Kopija bus `unmute/AETERNA-install.apk`.

Jei `gradlew` dar nėra, Android Studio atidarius projektą vieną kartą sugeneruos wrapper, arba:

```powershell
cd android
gradle wrapper
.\gradlew.bat assembleDebug
```

## 4. Įdiekite telefone

1. Nukopijuokite `app-debug.apk` į telefoną
2. Įjunkite **Įdiegti iš nežinomų šaltinių** (failų tvarkyklė / Chrome)
3. Atidarykite APK

Programėlė pagal nutylėjimą atidaro **titulinį puslapį** (`/`).

## 6. Automatiniai atnaujinimai (OTA + serverio konfigūracija)

**Nereikia rankiniu būdu keisti serverio adreso** — programėlė pati ima adresą iš debesies (`/api/v1/app/config`).

| Kas atnaujinama | Kaip |
|-----------------|------|
| Svetainė, mišios, UI pataisymai | Automatiškai per **WebView** (serveris / Vercel / Render) |
| Android APK (apvalkalas) | **OTA** — paleidus programėlę arba meniu **Tikrinti atnaujinimus** |

### Naują APK publikuoti (vienas kartas po pataisymų)

```powershell
cd android
.\build-apk.ps1
git add api/releases/android web/public/releases
git commit -m "Android OTA build"
git push
```

Skriptas padidina `versionCode`, įkelia APK į `api/releases/android/` ir `web/public/releases/`, atnaujina `update.json`.

**Pirmą kartą** telefone — įdiegti `AETERNA-install.apk`. Vėliau — programėlė pati pasiūlys naują versiją (reikia leisti įdiegti atnaujinimus).

Po kiekvieno APK atnaujinimo telefone **automatiškai** vėl įjungiamas serverio adresas iš debesies (nebereikia vesti IP).

## 5. Serverio adresas (tik LAN testavimui)

Meniu **⋮** → **Serverio adresas** — naudokite tik jei testuojate su `npm run dev:lan` namuose. Production — palikite automatinį režimą.

## Troubleshooting

| Problema | Sprendimas |
|----------|------------|
| **PC mato pakeitimus, telefonas ne** | PC = `localhost:3000`. Telefonas = **https://aeterna-web-six.vercel.app**. Reikia `git push` → Vercel deploy, tada **⋮ → Perkrauti iš serverio**. LAN testui: `http://192.168.x.x:3000` nustatymuose. |
| Balta / klaidos puslapis | Ar `npm run dev:lan` veikia? Naršyklėje telefone atidarykite `http://IP:3000/m/ona-demo` |
| API neveikia | `NEXT_PUBLIC_API_URL` turi būti PC IP, ne `127.0.0.1` |
| Windows Firewall | Leiskite Node.js (portai 3000, 4000) privačiame tinkle |
| Tik HTTP | Dev APK leidžia HTTP; production reikės HTTPS |
| Senas vaizdas po atnaujinimo | Meniu **Perkrauti iš serverio** (valo talpyklą). Viršuje matote adresą ir `v9` — palyginkite su PC. |

## Vėliau (production)

- `next build` + deploy į HTTPS
- APK su fiksuotu `https://…` arba **Capacitor** su įdiegta statika
- Play Store pasirašymas (release keystore)
