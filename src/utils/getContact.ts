import { Message } from "whatsapp-web.js";

export async function getContact(message: Message) {
  try {
    const currentContact = await message.getContact();
    const picUrl = await currentContact.getProfilePicUrl();

    return {
      picUrl:
        picUrl ||
        "https://scontent.fltx1-1.fna.fbcdn.net/v/t39.30808-6/271890842_5551345774882328_5126252034092896037_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=174925&_nc_eui2=AeFGDepF56TfqdA7f4wPvnLOAqrx8-FEI9oCqvHz4UQj2jzJvoAH30CVHP2Or90sejN3fRMDC4gNe19llNw6Wx8P&_nc_ohc=t4uVgFWuGfUAX83SBRO&_nc_ht=scontent.fltx1-1.fna&oh=00_AfDROmUBC7unKPpSOvGrLC6-lro3wo3vyQFwHezWZK7aOQ&oe=6454B3B1",
      name: currentContact.name || "Jean Paul Mayorga",
      number: currentContact.number,
    };
  } catch {
    return {
      picUrl:
        "https://scontent.fltx1-1.fna.fbcdn.net/v/t39.30808-6/271890842_5551345774882328_5126252034092896037_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=174925&_nc_eui2=AeFGDepF56TfqdA7f4wPvnLOAqrx8-FEI9oCqvHz4UQj2jzJvoAH30CVHP2Or90sejN3fRMDC4gNe19llNw6Wx8P&_nc_ohc=t4uVgFWuGfUAX83SBRO&_nc_ht=scontent.fltx1-1.fna&oh=00_AfDROmUBC7unKPpSOvGrLC6-lro3wo3vyQFwHezWZK7aOQ&oe=6454B3B1",
      name: "Jean Paul Mayorga",
      number: "593962975512",
    };
  }
}
