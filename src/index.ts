// cannister code goes here
import { v4 as uuidv4 } from 'uuid';
import { Server, StableBTreeMap, ic } from 'azle';
import express from 'express';

class Email {
   id: string;
   sender: string;
   recipient: string;
   subject: string;
   body: string;
   attachmentURL: string;
   createdAt: Date;
   updatedAt: Date | null;
}

const emailsStorage = StableBTreeMap<string, Email>(0);

export default Server(() => {
   const app = express();
   app.use(express.json());

   app.post("/emails", (req, res) => {
      const email: Email = {id: uuidv4(), createdAt: getCurrentDate(), ...req.body};
      emailsStorage.insert(email.id, email);
      res.json(email);
   });

   app.get("/emails", (req, res) => {
      res.json(emailsStorage.values());
   });

   app.get("/emails/:id", (req, res) => {
      const emailId = req.params.id;
      const emailOpt = emailsStorage.get(emailId);
      if ("None" in emailOpt) {
         res.status(404).send(`Email with id=${emailId} not found`);
      } else {
         res.json(emailOpt.Some);
      }
   });

   app.put("/emails/:id", (req, res) => {
      const emailId = req.params.id;
      const emailOpt = emailsStorage.get(emailId);
      if ("None" in emailOpt) {
         res.status(400).send(`Couldn't update email with id=${emailId}. Email not found`);
      } else {
         const email = emailOpt.Some;
         const updatedEmail = { ...email, ...req.body, updatedAt: getCurrentDate()};
         emailsStorage.insert(email.id, updatedEmail);
         res.json(updatedEmail);
      }
   });

   app.delete("/emails/:id", (req, res) => {
      const emailId = req.params.id;
      const deletedEmail = emailsStorage.remove(emailId);
      if ("None" in deletedEmail) {
         res.status(400).send(`Couldn't delete email with id=${emailId}. Email not found`);
      } else {
         res.json(deletedEmail.Some);
      }
   });

   return app.listen();
});

function getCurrentDate() {
   const timestamp = new Number(ic.time());
   return new Date(timestamp.valueOf() / 1000_000);
}
