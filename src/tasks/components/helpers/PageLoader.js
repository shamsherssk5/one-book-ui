import Loader from "react-loader-spinner";

const PageLoader = ({ visible, message }) => {
    return (visible &&
        <div className="page-loader">
            <div className="page-loader-content">
                <Loader
                    className="p-lo"
                    type="Bars"
                    color="#2687D7"
                    height={document.body.clientWidth/15}
                    width={document.body.clientWidth/15}
                    timeout={3000000}
                />
                 <span className="page-loader-text">{message}</span>
            </div>
        </div>
    )
}

export default PageLoader;