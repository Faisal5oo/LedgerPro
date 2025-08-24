export const formatDate = (dateString) => {
  const date = new Date(dateString);
  
 
  const options = {
    weekday: 'long', 
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true, 
  };

  return date.toLocaleString('en-US', options);
};