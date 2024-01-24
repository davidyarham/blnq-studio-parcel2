import { dispatch } from '../../state/store';

async function getSharingDetails() {
    const blnqName = window.location.pathname.split('/')[2];
    if (blnqName !== undefined) {
        const response = await fetch(`/api/v1/blnqs/${blnqName}/sharing`);
        const details = await response.json();
        dispatch('updateSharingDetails', details);
    }
}

export default getSharingDetails;
