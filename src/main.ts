declare global {
  interface Window {
    Tesseract: any;
  }
}

interface progress {
  progress: number;
  status: string;
}

// Module
const Tesseract = window.Tesseract;

// HTMLElement
const uploadImageSVG = <HTMLElement>document.getElementById('upload-icon-svg');
const uploadedImage = <HTMLImageElement>(
  document.getElementById('uploaded-image')
);
const decriptionUpload = <HTMLSpanElement>(
  document.getElementById('upload-description')
);
const SUBMIT_EXTRACT_BUTTON = <HTMLButtonElement>(
  document.getElementById('submit-extract')
);

const imageInput = <HTMLInputElement>document.querySelector('#input-image');
const imageInputContainer = <HTMLLabelElement>(
  document.getElementById('input-image-container')
);

const languageSelect = <HTMLSelectElement>(
  document.getElementById('language-select')
);

const whitelistTextArea = <HTMLTextAreaElement>(
  document.getElementById('whitelist-characters')
);
const resultContainer = <HTMLDivElement>(
  document.getElementById('result-container')
);

const resultContent = <HTMLParagraphElement>(
  document.getElementById('result-content')
);

const progressBar = <HTMLProgressElement>document.getElementById('progressbar');
const progressBarContainer = <HTMLDivElement>(
  document.getElementById('progressbar-container')
);

const progressStatue = <HTMLSpanElement>(
  document.getElementById('progress-statue')
);

const buttonCopyToClipboard = <HTMLButtonElement>(
  document.getElementById('copy-to-clipoard')
);

const buttonDownloadResult = <HTMLButtonElement>(
  document.getElementById('download-result')
);

/**
 *
 */
const hideUploadIconAndDescription = () => {
  uploadedImage.style.display = 'block';
  decriptionUpload.style.display = 'none';
  uploadImageSVG.style.display = 'none';
  decriptionUpload.remove();
  uploadImageSVG.remove();
  progressBarContainer.style.visibility = 'visible';
};

/**
 * imageInput load
 */
const imageLoaded = (e: any) => {
  const file = e.target.files[0];
  uploadedImage.src = URL.createObjectURL(file);

  progressStatue.innerText = '';
};

const imageDragEnter = () => {
  imageInputContainer.classList.add('blue-box-shadow');
};

const imageDragStopped = () => {
  imageInputContainer.classList.remove('blue-box-shadow');
};

imageInput.addEventListener('dragenter', imageDragEnter, false);
imageInput.addEventListener('dragleave', imageDragStopped, false);
imageInput.addEventListener('drop', imageDragStopped, false);

imageInput.addEventListener('change', imageLoaded);
imageInput.addEventListener('change', hideUploadIconAndDescription, {
  once: true,
});

/**
 *
 * @param {HTMLElement} element Element to which add the {@link classNameToAdd} with a delay of {@link delay}
 * @param {string} classNameToAdd
 * @param {delay} delay
 */
const addCLassToElementWithDelay = (
  element: HTMLElement,
  classNameToAdd: string,
  delay: number
) => {
  element.classList.add(classNameToAdd);
  setTimeout(() => {
    element.classList.remove(classNameToAdd);
  }, delay);
};

/**
 *
 */
const handleButtonClick = () => {
  const file: File = (imageInput.files as FileList)[0];
  if (file != undefined) {
    const whitelist = whitelistTextArea.value;
    const language: string = languageSelect.value;

    progressBar.style.visibility = 'visible';
    progressBar.value = 0;
    progressStatue.innerText = '0%';

    extractText(file, language, whitelist);
  } else {
    addCLassToElementWithDelay(imageInputContainer, 'red-box-shadow', 1400);
  }
};

SUBMIT_EXTRACT_BUTTON.onclick = handleButtonClick;

const copyToClipboard = () => {
  const textToCopy = resultContent.innerText;
  navigator.clipboard.writeText(textToCopy);
};

buttonCopyToClipboard.addEventListener('click', copyToClipboard);

const download = (filename: string, text: string) => {
  const element = document.createElement('a');
  element.setAttribute(
    'href',
    'data:text/plain;charset=utf-8,' + encodeURIComponent(text)
  );
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();
  element.remove();
};

// Start file download.
buttonDownloadResult.addEventListener(
  'click',
  function () {
    // Generate download of hello.txt file with some content
    const textToCopy = resultContent.innerText;
    const filename = languageSelect.value + '-' + Date.now().toString();

    download(filename, textToCopy);
  },
  false
);

/**
 *
 * @param progress
 */
const progressUpdate = (progress: progress): void => {
  // console.log(progress);
  if (progress.status === 'recognizing text') {
    const progressVal = progress.progress;
    progressBar.value = progressVal;
    progressStatue.innerText = Math.round(progressVal * 100).toString() + '%';
  }
};

/**
 *
 * @param duration provided in milliseconds
 */
const getDurationTime = (duration: number): string => {
  const durationString = duration.toString();
  if (duration < 1000) {
    return durationString + 'ms';
  }
  const length = durationString.length;
  const seconds = durationString.slice(0, length - 3);
  const milliseconds = durationString.slice(length - 3);
  return seconds + '.' + milliseconds + 's';
};

/**
 *
 * @param file
 * @param language
 */
const extractText = async (
  file: File,
  language: string,
  whitelist: string = ''
): Promise<void> => {
  const worker = Tesseract.createWorker({
    logger: progressUpdate,
  });

  const startTextEtracting = Date.now();

  await worker.load();
  await worker.loadLanguage(language);
  await worker.initialize(language);
  await worker.setParameters({
    tessedit_char_whitelist: whitelist,
  });
  const {
    data: { text },
  } = await worker.recognize(
    // 'https://tesseract.projectnaptha.com/img/eng_bw.png'
    file
  );
  resultContent.innerText = text;

  addCLassToElementWithDelay(resultContainer, 'green-box-shadow', 3000);
  const endTextExtracting = Date.now();
  const extractingDuration = endTextExtracting - startTextEtracting;

  progressStatue.innerText =
    'Finished in ' + getDurationTime(extractingDuration);
  progressBar.style.visibility = 'hidden';

  await worker.terminate();
};

import './credentials';

export {};
