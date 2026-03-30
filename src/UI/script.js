const navbar = document.getElementById('navbar');
const folderNotSelected = document.getElementById('folderNotSelected');
const mainPage = document.getElementById('mainPage');
const filesPanel = document.getElementById('filesPanel');
const vidplayer = document.getElementById('vidplayer');
const vidtitle = document.getElementById('vidtitle');
const timeline = document.getElementById('timeline');
const playPauseBtn = document.getElementById('playPauseBtn');
const controlls = document.getElementById('controlls');
const currVidTime = document.getElementById('currVidTime');
const totalVidTime = document.getElementById('totalVidTime');
const recentFolders = document.getElementById('recent-folders');
const recents = document.getElementById('recents');
const searchBar = document.getElementById('searchBar');
const searchCancelBtn = document.getElementById('searchCancelBtn');
const infoList = document.getElementById('infoList');
const searchBarInp = document.getElementById('searchBarInp');
const audioTracks = document.getElementById('audioTracks');

const fileslist = [];
const fileNameAndIndexMappings = {};

let defaultSelectedFile;
let isVideoPlaying = true;
let currentVideoPlaying = -1;
let vidRotation = 0;
let deboundingTimeOut;
let isSearchInputInFocus = false;


window.vidPlayer.folderSelected(({ folderPath, fileName }) => {
  folderNotSelected.style.display = 'none';
  mainPage.style.display = 'flex';
  saveToRecentFolderList(folderPath);
  searchBar.style.display = 'flex';
  defaultSelectedFile = fileName;
});

const saveToRecentFolderList = (folderPath) => {
  const folder_list = localStorage.getItem('recent-folder');
  const list = [];
  list.push(folderPath);
  if (folder_list) try {
    const temp = JSON.parse(folder_list);
    if (typeof temp === 'object' && Array.isArray(temp)) list.push(...temp.filter(fp => fp !== folderPath));
  } catch (_) { }
  localStorage.setItem('recent-folder', JSON.stringify(list));
}

const getRecentFolderList = () => {
  const folder_list = localStorage.getItem('recent-folder');
  const list = [];
  if (folder_list) try {
    const temp = JSON.parse(folder_list);
    if (typeof temp === 'object' && Array.isArray(temp)) list.push(...temp);
  } catch (_) { }
  return list;
}

const deleteRecentFolderList = () => {
  localStorage.removeItem('recent-folder');
  recents.style.display = 'none';
}


window.vidPlayer.addFileIntoList((fileInfo) => {
  fileslist.push(fileInfo);
  fileNameAndIndexMappings[fileInfo.name] = fileslist.length - 1;

  const button = document.createElement('button');
  button.innerText = fileInfo.name;
  button.className = 'fileBtn';
  button.id = 'fileBtn' + (fileslist.length - 1);
  button.addEventListener('click', async () => { startVideo(fileNameAndIndexMappings[fileInfo.name]); });
  filesPanel.appendChild(button);

  if (fileInfo.name === defaultSelectedFile) startVideo(fileNameAndIndexMappings[fileInfo.name]);
  else if (!defaultSelectedFile && currentVideoPlaying === -1) startVideo(0);
});

const inputChange = (el) => { vidplayer.currentTime = vidplayer.duration * (el.value / 100); };

const startVideo = (index) => {
  try {
    isVideoPlaying = true;
    playPauseBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"class="lucide lucide-play-icon lucide-play"><path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z" /></svg>';
    timeline.value = 0;
    timeline.style.display = 'flex';
    vidtitle.innerText = 'Playing : ' + fileslist[index].name;
    videoRotate(null);

    if (currentVideoPlaying !== -1) document.getElementById('fileBtn' + currentVideoPlaying).classList = 'fileBtn';
    const currentBtn = document.getElementById('fileBtn' + index);
    currentBtn.classList = 'fileBtn fileBtnSelected';
    currentBtn.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });

    vidplayer.src = fileslist[index].path;
    vidplayer.setAttribute('title', fileslist[index].name);
    if (currentVideoPlaying === -1) vidplayer.volume = 0.7;
    currentVideoPlaying = index;

    if (searchBarInp.value) doNoShowInSearchInfoList(true);

  } catch (err) { console.error(err) }
}

const playPauseVideo = () => {
  if (isVideoPlaying) {
    vidplayer.pause()
    isVideoPlaying = false;
  }
  else {
    vidplayer.play()
    isVideoPlaying = true;
  }
}

const onVideoPlay = () => {
  playPauseBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pause-icon lucide-pause"><rect x="14" y="3" width="5" height="18" rx="1"/><rect x="5" y="3" width="5" height="18" rx="1"/></svg>';
}

const onVideoPause = () => {
  playPauseBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"class="lucide lucide-play-icon lucide-play"><path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z" /></svg>';
}

const videoTimeUpdate = () => {
  timeline.value = (vidplayer.currentTime / vidplayer.duration) * 100;
  currVidTime.innerText = formatTime(vidplayer.currentTime);
  totalVidTime.innerText = formatTime(vidplayer.duration);

  if (vidplayer.currentTime === vidplayer.duration) startNextVid();
}

const startNextVid = () => {
  if (currentVideoPlaying + 1 >= fileslist.length) startVideo(0);
  else startVideo(currentVideoPlaying + 1);
}

const startPrevVid = () => {
  if (currentVideoPlaying === 0) startVideo(fileslist.length - 1);
  else startVideo(currentVideoPlaying - 1);
}

function formatTime(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  return [
    hrs.toString().padStart(2, '0'),
    mins.toString().padStart(2, '0'),
    secs.toString().padStart(2, '0')
  ].join(':');
}

const mouseOverVidPlayer = () => {
  playPauseBtn.style.opacity = 1;
  controlls.style.transform = 'translateY(0%)';
  controlls.style.opacity = 1;
}

const mouseLeaveVidPlayer = () => {
  playPauseBtn.style.opacity = 0;
  controlls.style.transform = 'translateY(100%)';
  controlls.style.opacity = 0;
}

const videoRotate = (dir) => {
  vidRotation = (dir === 'LEFT') ? (vidRotation - 90) : (vidRotation + 90);
  if (dir === null) vidRotation = 0;
  vidplayer.style.transform = `rotate(${vidRotation}deg)`
}

const volumeChange = (dir) => {
  if (dir === 'UP') vidplayer.volume = vidplayer.volume + 0.1;
  else if (dir === 'DOWN') vidplayer.volume = vidplayer.volume - 0.1;
}

const doNoShowInSearchInfoList = (searchCancelBtnAlso = false) => {
  if (searchCancelBtnAlso) {
    searchCancelBtn.style.display = 'none';
    searchBarInp.value = "";
  }
  infoList.style.display = 'none';
  infoList.innerHTML = '';
}

const searchFocusChange = () => {
  isSearchInputInFocus = !isSearchInputInFocus
  if (isSearchInputInFocus) searchBarInpChange(searchBarInp.value);
  else doNoShowInSearchInfoList();
};

const searchBarInpChange = (inp) => {
  if (inp && isSearchInputInFocus) {
    searchCancelBtn.style.display = 'block';
    infoList.style.display = 'flex';
    if (deboundingTimeOut) clearTimeout(deboundingTimeOut);
    setTimeout(() => {
      infoList.innerHTML = '';
      fileslist.forEach((file) => {
        if (file.name.includes(inp)) {
          const button = document.createElement('button');
          button.innerHTML = file.name.replaceAll(inp, `<span>${inp}</span>`);
          infoList.appendChild(button);

          button.addEventListener('click', () => { startVideo(fileNameAndIndexMappings[file.name]) });
        }
      });
      if (infoList.childNodes.length === 0) infoList.innerText = 'No video found :('
    }, 500);
  } else doNoShowInSearchInfoList(true);
}

const changeSpeed = (speed) => {
  const currentTime = vidplayer.currentTime;
  vidplayer.defaultPlaybackRate = speed;
  vidplayer.load();
  vidplayer.currentTime = currentTime;
  vidplayer.play();
}

const updateAudioTracksList = () => {
  if (vidplayer.audioTracks && vidplayer.audioTracks.length > 0) {
    audioTracks.style.display = 'block';
    audioTracks.innerHTML = '';
    for (let i in vidplayer.audioTracks) {
      const op = document.createElement('option');
      op.innerText = vidplayer.audioTracks[parseInt(i)].language + ' - ' + vidplayer.audioTracks[parseInt(i)].label;
      op.selected = vidplayer.audioTracks[parseInt(i)].enabled;
      op.value = i;
      audioTracks.appendChild(op);
    }
  } else {
    audioTracks.style.display = 'none';
  }
}

const changeAudioTrack = (i) => { vidplayer.audioTracks[parseInt(i)].enabled = true; }


// INIT
(() => {
  document.addEventListener('keyup', (event) => {
    try {
      if (currentVideoPlaying !== -1) {
        if (event.key === ' ') playPauseVideo();
        else if (event.key === 'n' && !isSearchInputInFocus) startNextVid();
        else if (event.key === 'N' && !isSearchInputInFocus) startPrevVid();
        else if (event.key === 'r' && !isSearchInputInFocus) videoRotate('RIGHT');
        else if (event.key === 'R' && !isSearchInputInFocus) videoRotate('LEFT');
        else if (event.key === 'p' && !isSearchInputInFocus) vidplayer.requestPictureInPicture();
        else if (event.key === 'f' && !isSearchInputInFocus && !document.fullscreenElement) vidplayer.requestFullscreen();
        else if (event.key === 'f' && !isSearchInputInFocus && document.fullscreenElement) document.exitFullscreen();
        else if (event.key === '1' && !isSearchInputInFocus) changeSpeed('1');
        else if (event.key === '2' && !isSearchInputInFocus) changeSpeed('2');
        else if (event.key === '3' && !isSearchInputInFocus) changeSpeed('3');
        else if (event.key === '4' && !isSearchInputInFocus) changeSpeed('4');
        else if (event.key === '5' && !isSearchInputInFocus) changeSpeed('5');
        else if (event.key === '6' && !isSearchInputInFocus) changeSpeed('6');
        else if (event.key === '7' && !isSearchInputInFocus) changeSpeed('7');
        else if (event.key === '8' && !isSearchInputInFocus) changeSpeed('8');
        else if (event.key === '9' && !isSearchInputInFocus) changeSpeed('9');

      }
    } catch (_) { }
  });
  document.addEventListener('keydown', (event) => {
    try {
      if (currentVideoPlaying !== -1) {
        if (event.key === 'ArrowLeft') vidplayer.currentTime = ((vidplayer.currentTime - 5) <= 0) ? 0 : (vidplayer.currentTime - 5);
        else if (event.key === 'ArrowRight') vidplayer.currentTime = ((vidplayer.currentTime + 5) >= vidplayer.duration) ? vidplayer.duration : (vidplayer.currentTime + 5);
        else if (event.key === 'ArrowUp') volumeChange('UP');
        else if (event.key === 'ArrowDown') volumeChange('DOWN');
      }
    } catch (_) { }
  });


  const folderList = getRecentFolderList();

  if (folderList.length) recents.style.display = 'block';

  for (let i = 0; (i < folderList.length && i < 4); i++) {
    const element = document.createElement('button');
    element.innerText = folderList[i];
    element.addEventListener('click', () => { window.vidPlayer.openFolder(folderList[i]); });
    recentFolders.appendChild(element);
  }

  navigator.mediaSession.metadata = new MediaMetadata({
    title: "NooB Video Player",
    artist: "me@fardeenkhan.dev",
    album: "Local Files"
  });

  if (window.vidPlayer.platform === 'darwin') navbar.style.display = 'none';
})()