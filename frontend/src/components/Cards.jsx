const Card = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;