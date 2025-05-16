import React from 'react'
import './Contact.css'

const Contact = () => {
    const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
    
        formData.append("access_key", "b3b90a5d-22f1-4046-8415-660bbc0fd28c");

        const object = Object.fromEntries(formData);
        const json = JSON.stringify(object);
    
        const res = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
          },
          body: json
        }).then((res) => res.json());
    
        if (res.success) {
          console.log("Success", res);
        }
    };

    return (
        <section className="contact">
            <form onSubmit={onSubmit}>
                <h2>Contact form</h2>
                <div className='input-box'>
                    <label>Full Name</label>
                    <input type="text" className="field" placeholder="Enter your name" name="name" required />
                </div>
                <div className='input-box'>
                    <label>Email Address</label>
                    <input type="email" className="field" placeholder="Enter your email" name="email" required />
                </div>
                <div className='input-box'>
                    <label>Your Message</label>
                    <textarea name="message" id="" className="fieldmess" placeholder="Enter your message" required> </textarea>
                </div>
                <button type="submit">Send your messsage</button>
            </form>
        </section>
    );
}

export default Contact;