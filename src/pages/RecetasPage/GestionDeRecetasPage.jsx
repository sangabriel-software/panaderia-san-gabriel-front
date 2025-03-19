import { Container } from "react-bootstrap";
import useGetRecetas from "../../hooks/recetas/useGetRecetas";
import DotsMove from "../../components/Spinners/DotsMove";
import Alert from "../../components/Alerts/Alert";
import { BsExclamationTriangleFill } from "react-icons/bs";

const GestionDeRecetasPage = () => {
  const { recetas, loadingRecetas, showErrorRecetas, showInfoRecetas, setRecetas } = useGetRecetas();

  console.log(recetas);

  if (loadingRecetas) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "70vh" }} // Asegura que el contenedor ocupe toda la altura de la pantalla
      >
        <div>
          <DotsMove />
        </div>
      </Container>
    );
  }

    if (showErrorRecetas) {
      return (
        <Container className="justify-content-center align-items-center my-5">
          <div className="row justify-content-center">
            <div className="col-md-8 text-center">
              <Alert
                type="danger"
                message="Hubo un error al consultar los productos y sus ingrdientes."
                icon={<BsExclamationTriangleFill />}
              />
            </div>
          </div>
        </Container>
      );
    }

  return <p>recetas</p>;
};

export default GestionDeRecetasPage;