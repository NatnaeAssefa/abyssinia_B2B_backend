export function generateRandomCode(length = 6) {
  const charset = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let code = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    code += charset[randomIndex];
  }

  return code;
}

export function getTripRoom(trip_id: string){
  return `TripRoom_${trip_id}`
}

export default { generateRandomCode };
