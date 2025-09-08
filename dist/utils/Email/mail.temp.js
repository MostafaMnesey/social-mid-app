"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailTemplte = void 0;
const emailTemplte = ({ title, otp, }) => {
    return `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>${title}</title>
        <link
          rel="stylesheet"
          href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"
        />
        <style>
          body {
            margin: 0;
            background-color: #e4f1f2;
            font-family: Arial, sans-serif;
          }
    
          .email-container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 8px;
            border: 1px solid #ccc;
            overflow: hidden;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }
    
          .header {
            background-color: #630e2b;
            padding: 20px;
            text-align: center;
          }
    
          .header img {
            width: 60px;
            height: 60px;
          }
    
          .logo-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px;
          }
    
          .logo-bar img {
            width: 100px;
          }
    
          .logo-bar a {
            text-decoration: none;
            color: #630e2b;
            font-weight: bold;
            font-size: 14px;
          }
    
          .content {
            text-align: center;
            padding: 30px 20px;
          }
    
          .content h1 {
            color: #630e2b;
            margin-bottom: 10px;
          }
    
          .content p {
            color: #444;
            font-size: 16px;
            margin-bottom: 30px;
          }
    
          .btn {
            background-color: #630e2b;
            color: #fff;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 4px;
            font-size: 16px;
          }
    
          .social {
            text-align: center;
            padding: 20px;
            background-color: #f7f7f7;
          }
    
          .social h3 {
            color: #000;
            margin-bottom: 10px;
          }
    
          .social-icons a img {
            width: 40px;
            height: 40px;
            margin: 0 10px;
            border-radius: 50%;
            transition: transform 0.3s;
          }
    
          .social-icons a img:hover {
            transform: scale(1.1);
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="logo-bar">
            <img
              src="https://res.cloudinary.com/ddajommsw/image/upload/v1670702280/Group_35052_icaysu.png"
              alt="Logo"
            />
            <a href="http://localhost:4200/#/" target="_blank">View in Website</a>
          </div>
    
          <div class="header">
            <img
              src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703716/Screenshot_1100_yne3vo.png"
              alt="Mail Icon"
            />
          </div>
    
          <div class="content">
            <h1>${title}</h1>
            <p>Your otp is:${otp}</p>
            
          </div>
    
          <div class="social">
            <h3>Stay in Touch</h3>
            <div class="social-icons">
              <a href="${process.env.facebookLink}">
                <img
                  src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group35062_erj5dx.png"
                  alt="Facebook"
                />
              </a>
              <a href="${process.env.instegram}">
                <img
                  src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group35063_zottpo.png"
                  alt="Instagram"
                />
              </a>
              <a href="${process.env.twitterLink}">
                <img
                  src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group_35064_i8qtfd.png"
                  alt="Twitter"
                />
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
    `;
};
exports.emailTemplte = emailTemplte;
