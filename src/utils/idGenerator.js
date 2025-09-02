import rooms from '../services/roomService/roomService.js';

function generateUniqueId() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  function randomId() {
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  let id;
  do {
    id = randomId();
    console.log("Generated ID:", id, "Exists:", rooms.has(id));
  } while (rooms.has(id));
  return id;
}

let Counter = 1;
export function generateIncrementalId() {
  return Counter++;
}

export default generateUniqueId;