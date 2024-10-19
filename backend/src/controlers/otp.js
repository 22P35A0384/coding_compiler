import nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import fs from 'fs';
import otpmodel from '../models/otpmodel.js';

const Otp = async (req, res, next) => {
    const {email} = req.body;
    const otp = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;

    try {
        // Read the HTML template file
        const source = fs.readFileSync('public/mail_templates/otp.hbs', 'utf8');
        const template = handlebars.compile(source);

        // Render the template with OTP
        const mail = email.split('@')[0];
        const html = template({ otp,mail });

        // Create Nodemailer transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'venkatasaigangadharsgk@gmail.com',
                pass: 'kaic dlts bxmb ydqh'
            }
        });

        // Email options
        const mailOptions = {
            from: 'venkatasaigangadharsgk@gmail.com',
            to: email,
            subject: 'Greetings From Technical Hub',
            html: html
        };

        // Send email
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        const Otpupdate = await otpmodel.findOne({email:email})
        if(Otpupdate){
            const x = await otpmodel.findOneAndUpdate({email:email},{otp:otp})
            return res.send(true);
        }else{
            const formdata = new otpmodel({
                email:email,
                otp:otp
            })

            await formdata.save()
            return res.send(true);
        }
        // console.log(Otpupdate)
    } catch (err) {
        console.log(err);
        return res.status(500).send(false);
    }
};

export default Otp;
