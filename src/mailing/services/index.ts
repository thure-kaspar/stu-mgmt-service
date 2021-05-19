import { MailingListener } from "./mailing-listener.service";
import { MailingService } from "./mailing.service";
import { NodemailerService } from "./nodemailer.service";

export const Services = [MailingService, NodemailerService, MailingListener];
