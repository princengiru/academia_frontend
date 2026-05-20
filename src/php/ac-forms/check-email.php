<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Check Your Email</title>
    <style>
        @font-face {
            font-family: "Poppins";
            src: url("../fonts/poppins/Poppins-Regular.ttf") format("truetype");
            font-weight: 400;
            font-style: normal;
            font-display: swap;
        }

        @font-face {
            font-family: "Poppins";
            src: url("../fonts/poppins/Poppins-SemiBold.ttf") format("truetype");
            font-weight: 500;
            font-style: normal;
            font-display: swap;
        }

        @font-face {
            font-family: "Poppins";
            src: url("../fonts/poppins/Poppins-Bold.ttf") format("truetype");
            font-weight: 600;
            font-style: normal;
            font-display: swap;
        }

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
            --text-muted: #4b5675;
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
            text-align: center;
        }

        .status-illustration {
            display: block;
            margin: 0 auto 12px;
            width: 174px;
            height: auto;
        }

        .status-lead {
            margin-top: 10px;
            font-family: Inter;
            font-size: 18px;
            font-weight: 500;
            line-height: 18px;
            text-align: center;
            color: #071437;
        }

        .status-text {
            margin-top: 20px;
            font-family: Inter;
            font-size: 13px;
            font-weight: 400;
            line-height: 18px;
            text-align: center;
            color: var(--text-muted);
        }

        .status-text .address {
            color: #2c3b63;
            font-weight: 500;
        }

        .submit-btn {
            margin: 24px auto 0;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            max-width: 160px;
            height: 40px;
            border: none;
            border-radius: 8px;
            background: var(--primary);
            color: #ffffff;
            text-decoration: none;
            font-family: Inter;
            font-size: 13px;
            font-weight: 500;
            line-height: 14px;
            transition: background 0.2s ease;
        }

        .submit-btn:hover {
            background: var(--primary-hover);
        }

        .resend-row {
            margin-top: 18px;
            text-align: center;
            font-size: 13px;
            color: var(--text-muted);
        }

        .resend-row a {
            margin-left: 6px;
            color: var(--primary);
            text-decoration: none;
            font-weight: 500;
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
            .signin-card {
                padding: 20px 16px;
            }

            .left-col {
                padding: 14px;
            }

            .submit-btn {
                font-size: 17px;
            }

            .status-illustration {
                width: 150px;
            }
        }
    </style>
</head>
<body>
    <section class="left-col">
        <main class="signin-card">
            <img class="status-illustration" src="../assets/icons/remm.svg" alt="Check email illustration">

            <h2 class="status-lead">Check your email</h2>

            <p class="status-text">
                Please click the link sent to your email
                <span class="address">bob@reui.io</span>
                to verify your account. Thank you
            </p>

            <a class="submit-btn" href="../">Back to Home</a>

            <p class="resend-row">
                Didn’t receive an email?
                <a href="#">Resend</a>
            </p>
        </main>
    </section>

    <section class="right-col">
        <img src="bg.png" alt="visual">
    </section>
</body>
</html>
