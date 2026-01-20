import { Typography } from '@mui/material';
import React from 'react';

interface MessageRendererProps {
    message: string;
    sx?: any;
}

const MessageRenderer: React.FC<MessageRendererProps> = ({ message, sx }) => {
    // Simplified renderer without patient mentions for now
    return (
        <Typography
            sx={{
                whiteSpace: 'pre-wrap',
                ...sx,
            }}
        >
            {message}
        </Typography>
    );
};

export default MessageRenderer;
