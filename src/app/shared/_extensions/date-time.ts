export function calculateAge(birthday: string) {
    const birthdayDate = new Date(birthday);
    const birthYear = birthdayDate.getFullYear();
    const currentYear = new Date().getFullYear();

    let age = currentYear - birthYear;
    
    const checkDate = new Date(birthdayDate);
    checkDate.setFullYear(birthYear + age);
  
    if (checkDate > new Date()) {
      age--;
    }
  
    return age;
  };