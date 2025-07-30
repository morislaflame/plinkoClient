import React from 'react'

const ErrorPage: React.FC<{ title: string, message: string }> = ({ title, message }) => {
    return (
        <div>
            <h1>{title}</h1>
            <p>{message}</p>
        </div>
    )
}

export default ErrorPage;