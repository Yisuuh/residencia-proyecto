import { useLocation } from "react-router-dom";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const AbrirPDF = ({ url }) => {
  const handleOpen = () => {
    window.open(url, "_blank");
  };

  return (
    <button
      className="btn-accion"
      onClick={handleOpen}
      title="Visualizar PDF"
    >
      <i className="ri-eye-line"></i> Ver PDF
    </button>
  );
};

export default AbrirPDF;
