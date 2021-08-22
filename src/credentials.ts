const credentials = <HTMLDivElement>document.getElementById('credentials');
const currYear: string = new Date().getFullYear().toString();
credentials.innerText = `© ${currYear}, Bog-II`;
