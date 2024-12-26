import { ReactNode } from "react";
import ReactDOM from "react-dom";

const Modal = ({
  children,
  handleCloseModal,
}: {
  children?: ReactNode;
  handleCloseModal: () => void;
}) => {
  return ReactDOM.createPortal(
    <div className="modal-container">
      <button onClick={handleCloseModal} className="modal-underlay" />
      <div className="modal-content">{children}</div>
    </div>,
    document.getElementById("portal")!
  );
};
export default Modal;
