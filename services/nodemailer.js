import Mailjet from 'node-mailjet';
import dotenv from 'dotenv';
dotenv.config();

const mailjet = Mailjet.apiConnect(
  process.env.MJ_APIKEY_PUBLIC,   
  process.env.MJ_APIKEY_PRIVATE
);

export const sendVerificationMail = async (to, name, token) => {
  try {
    const request = await mailjet
      .post('send', { version: 'v3.1' })
      .request({
        Messages: [
          {
            From: {
              Email: "yagizhanaydin13@gmail.com",  
              Name: "Benimevimm",
            },
            To: [
              {
                Email: to,
                Name: name,
              },
            ],
            Subject: "Mail Doğrulama",
          TextPart: `Merhaba ${name}, doğrulama linkiniz: http://localhost:3000/api/verify?token=${token}`,
      HTMLPart: `<h3>Merhaba ${name}</h3><p>Doğrulama linkiniz: <a href="http://localhost:3000/api/verify?token=${token}">Doğrula</a></p>`,

          },
        ],
      });

    console.log('Mail gönderildi:', request.body);
  } catch (err) {
    console.error('Mail gönderme hatası:', err);
    throw err;
  }
};
