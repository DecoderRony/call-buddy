import React, { Component, ReactNode } from 'react';
import { BiError } from "react-icons/bi";

interface ErrorBoundaryProps {
    children?: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(_: Error): ErrorBoundaryState {
        // Update state so the next render will show the fallback UI
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        console.error("Error caught by Error Boundary:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            // Render any custom fallback UI
            return <>
                <div className="h-full grid grid-rows-1 grid-cols-2 gap-10 max-sm:hidden">
                    <div className="flex justify-end items-center">
                        <BiError size="15rem" />
                    </div>

                    <div className="flex flex-col justify-center gap-2">
                        <h1 className='sm:text-4xl sm:font-semibold'>Aw, Snap!</h1>
                        <div className='sm:text-lg'>Something went wrong while trying to load application</div>
                    </div>
                </div>

                <div className="h-full sm:hidden">
                    <div className="flex h-full flex-col justify-center items-center">
                        <BiError size="8rem" />
                        <div className="flex flex-col justify-center items-center gap-2">
                            <h1 className='text-xl font-semibold'>Aw, Snap!</h1>
                            <div className='text-sm'>Something went wrong while trying to load application</div>
                        </div>
                    </div>
                </div>
            </>
        }
        return this.props.children;
    }
}

export default ErrorBoundary;
