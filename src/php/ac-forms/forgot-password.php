<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Forgot Password</title>
    <style>
        @font-face {
            font-family: "Inter";
            src: url("../fonts/inter/Inter-VariableFont_opsz,wght.ttf") format("truetype");
            font-weight: 100 900;
            font-style: normal;
            font-display: swap;
        }

        :root {
            --page-bg: #ffffff;
            --card-border: #f1f1f4;
            --text-main: #071437;
            --text-muted: #4b5675;
            --field-border: #dbdfe9;
            --primary: #450468;
            --primary-hover: #46066d;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        html,
        body {
            width: 100%;
            height: 100%;
        }

        body {
            display: grid;
            grid-template-columns: minmax(0, 1fr) auto;
            height: 100vh;
            font-family: Inter, sans-serif;
            background: var(--page-bg);
        }

        .left-col {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
        }

        .signin-card {
            width: 100%;
            max-width: 420px;
            background: #ffffff;
            border: 1px solid var(--card-border);
            border-radius: 12px;
            padding: 28px 26px;
            box-shadow: 0 3px 4px 0 #00000008;
        }

        .signin-title {
            font-size: 18px;
            font-weight: 500;
            line-height: 18px;
            text-align: center;
            color: var(--text-main);
        }

        .signin-subtitle {
            margin-top: 8px;
            text-align: center;
            color: var(--text-muted);
            font-size: 13px;
            font-weight: 400;
            line-height: 14px;
        }

        .field-group {
            display: flex;
            flex-direction: column;
            gap: 10px;
            margin-top: 24px;
        }

        .field-group > label {
            color: var(--text-main);
            font-size: 13px;
            font-weight: 400;
            line-height: 14px;
        }

        .input-wrap input {
            width: 100%;
            height: 40px;
            border: 1px solid var(--field-border);
            border-radius: 6px;
            background: transparent;
            color: #2e3a54;
            font-size: 13px;
            font-weight: 400;
            line-height: 14px;
            padding: 0 12px;
            outline: none;
        }

        .input-wrap input::placeholder {
            color: #8a94a9;
            opacity: 1;
        }

        .input-wrap input:focus {
            border-color: #b6bfd1;
            box-shadow: 0 0 0 3px rgba(84, 11, 128, 0.08);
        }

        .submit-btn {
            margin-top: 18px;
            width: 100%;
            height: 40px;
            border: none;
            border-radius: 8px;
            background: var(--primary);
            color: #ffffff;
            font-size: 13px;
            font-weight: 500;
            line-height: 14px;
            cursor: pointer;
            transition: background 0.2s ease;
        }

        .submit-btn:hover {
            background: var(--primary-hover);
        }

        .right-col {
            height: 100vh;
            background: #f5f7fb;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .right-col img {
            display: block;
            height: 100vh;
            width: auto;
            user-select: none;
            -webkit-user-drag: none;
        }

        @media (max-width: 900px) {
            body {
                grid-template-columns: 1fr;
                height: auto;
                min-height: 100vh;
            }

            .right-col {
                height: auto;
                min-height: 50vh;
            }

            .right-col img {
                height: auto;
                width: 100%;
                max-height: 50vh;
                object-fit: contain;
            }

            .signin-card {
                max-width: 560px;
            }
        }

        @media (max-width: 560px) {
            .left-col {
                padding: 14px;
            }

            .signin-card {
                padding: 20px 16px;
            }

            .submit-btn {
                font-size: 17px;
            }
        }
    </style>
</head>
<body>
    <section class="left-col">
        <form class="signin-card" action="check-email.php" method="post">
            <h1 class="signin-title">Your Email</h1>
            <p class="signin-subtitle">Enter your email to reset password</p>

            <div class="field-group">
                <label for="email">Email</label>
                <div class="input-wrap">
                    <input id="email" name="email" type="email" placeholder="email@email.com" required>
                </div>
            </div>

            <button class="submit-btn" type="submit">Continue &rarr;</button>
        </form>
    </section>

    <section class="right-col">
        <img src="bg.png" alt="visual">
    </section>
</body>
</html>
