export const hubUsername = 'copapps';
export const hubPassword = 'C9C-2EZ-gQ4-ezY';

const getBaseUrl = () => {
    if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
        // run proxy `npm run proxy` to use this url
        return 'http://localhost:3031';
    } else {
        return 'https://eoapps.solenix.ch';
    }
}
export const sciHubUrl = `${getBaseUrl()}/scihub/search`;