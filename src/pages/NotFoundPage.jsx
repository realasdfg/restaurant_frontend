const NotFoundPage = ({message}) => {
    return (
        <div className="bg-gray-200 font-mono min-h-screen flex flex-col">
            <div>
                <h1 className="text-center">404 {message  || 'Strona nie istnieje'}</h1>
            </div>
        </div>
    );
};

export default NotFoundPage;