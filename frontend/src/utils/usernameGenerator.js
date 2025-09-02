const names = [
  // Boys
  "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun",
  "Sai", "Reyansh", "Krishna", "Ishaan", "Kabir",
  "Rudra", "Dhruv", "Atharv", "Aryan", "Rohan",
  "Kunal", "Om", "Harsh", "Samar", "Aniket",
  "Manan", "Yash", "Kartik", "Ayaan", "Laksh",

  // Girls
  "Ananya", "Diya", "Aadhya", "Myra", "Ira",
  "Prisha", "Riya", "Anvi", "Aarohi", "Saanvi",
  "Ishita", "Meera", "Tanvi", "Navya", "Kavya",
  "Pooja", "Sneha", "Nisha", "Shreya", "Manya",
  "Avni", "Trisha", "Muskaan", "Pallavi", "Suhani"
];

export default function generateUsername() {
  const randomName = names[Math.floor(Math.random() * names.length)];
  const randomNum = Math.floor(Math.random() * 1000); // to avoid duplicates
  return `#${randomName}${randomNum}`;
}
