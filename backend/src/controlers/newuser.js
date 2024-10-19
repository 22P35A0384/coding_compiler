import Newuserschema from '../models/user.js';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import handlebars from 'handlebars';

const Newuser = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        // Check if a user with the given username already exists
        const existingUser = await Newuserschema.findOne({ username });
        if (existingUser) {
            return res.status(200).json({ msg:1 });
        }

        // Hash the password
        const hashedPassword = bcrypt.hashSync(password, 10); // You can specify the number of salt rounds (e.g., 10)

        // Create a new user document
        const formdata = new Newuserschema({
            username,
            email,
            password: hashedPassword,
            type_of_user: "student"
        });

        // Save the new user data to the database
        await formdata.save();

        // Send a welcome email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'venkatasaigangadharsgk@gmail.com',
                pass: 'kaic dlts bxmb ydqh' // Replace with environment variables in production
            }
        });
        const source = fs.readFileSync('public/mail_templates/welcome_mail.hbs', 'utf8');
        const template = handlebars.compile(source);
        const html = template({ username });
        const mailOptions = {
            from: 'venkatasaigangadharsgk@gmail.com',
            to: email,
            subject: 'Welcome To Gangadhar Coding Compiler',
            html: html
        };
        await transporter.sendMail(mailOptions);
        
        // Respond with a success message
        return res.status(200).json({ msg: 2 });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ msg: 3 });
    }
};

export default Newuser;
