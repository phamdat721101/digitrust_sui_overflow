import React from "react";

const Transactions_fill = ({state}:{state:any}) => {
  return (
    <svg  width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M15 8L14 7V2H4V22H20V8L15 8ZM19.4142 6L16 2.58579V6L19.4142 6ZM12 9H8V7H12V9ZM8 13V11H16V13H8ZM8 15V17H16V15H8Z" fill={state?'#1D4ED8':'#4F4B5C'}/>
    </svg>
  );
};

export default Transactions_fill;
