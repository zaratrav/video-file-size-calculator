// Codec bitrates (Mbps at base resolution)
const codecs = {
    'prores-raw': { name: 'ProRes RAW (12-bit)', bitrate: 920, base: '4K' },
    'prores-raw-hq': { name: 'ProRes RAW HQ (12-bit)', bitrate: 920, base: '4K' },
    'prores-422-hq': { name: 'ProRes 422 HQ', bitrate: 500, base: '4K' },
    'prores-422': { name: 'ProRes 422', bitrate: 250, base: '4K' },
    'prores-422-lt': { name: 'ProRes 422 LT', bitrate: 145, base: '4K' },
    'prores-proxy': { name: 'ProRes Proxy', bitrate: 45, base: '4K' },
    'dnxhd-145': { name: 'DNxHD 145 (1080p)', bitrate: 145, base: '1080p' },
    'dnxhd-220': { name: 'DNxHD 220 (1080p)', bitrate: 220, base: '1080p' },
    'dnxhr-hqx': { name: 'DNxHR HQX', bitrate: 500, base: '4K' },
    'h264': { name: 'H.264 (5 Mbps)', bitrate: 5, base: 'any' },
    'h265': { name: 'H.265/HEVC (5 Mbps)', bitrate: 5, base: 'any' }
};

const scenarios = {
    'prores-raw-4k-24fps-1hr': {
        resolution: '4096x2160',
        frameRate: '23.976',
        codec: 'prores-raw',
        hours: 1, minutes: 0, seconds: 0
    },
    'prores-422-hq-4k-30fps-8hr': {
        resolution: '3840x2160',
        frameRate: '29.97',
        codec: 'prores-422-hq',
        hours: 8, minutes: 0, seconds: 0
    },
    'h264-1080p-60fps-30min': {
        resolution: '1920x1080',
        frameRate: '60',
        codec: 'h264',
        hours: 0, minutes: 30, seconds: 0
    }
};

document.getElementById('resolution').addEventListener('change', function() {
    if (this.value === 'custom') {
        document.getElementById('customResGroup').style.display = 'block';
        document.getElementById('customHeightGroup').style.display = 'block';
    } else {
        document.getElementById('customResGroup').style.display = 'none';
        document.getElementById('customHeightGroup').style.display = 'none';
    }
    calculateFileSize();
});

document.getElementById('frameRate').addEventListener('change', function() {
    if (this.value === 'custom') {
        document.getElementById('customFpsGroup').style.display = 'block';
    } else {
        document.getElementById('customFpsGroup').style.display = 'none';
    }
    calculateFileSize();
});

document.getElementById('codec').addEventListener('change', function() {
    if (this.value === 'custom') {
        document.getElementById('customBitrateGroup').style.display = 'block';
    } else {
        document.getElementById('customBitrateGroup').style.display = 'none';
    }
    calculateFileSize();
});

function loadScenario(scenario) {
    const data = scenarios[scenario];
    document.getElementById('resolution').value = data.resolution;
    document.getElementById('frameRate').value = data.frameRate;
    document.getElementById('codec').value = data.codec;
    document.getElementById('hours').value = data.hours;
    document.getElementById('minutes').value = data.minutes;
    document.getElementById('seconds').value = data.seconds;
    calculateFileSize();
}

function calculateFileSize() {
    // Get resolution
    let width, height;
    const resValue = document.getElementById('resolution').value;
    
    if (resValue === 'custom') {
        width = parseInt(document.getElementById('customWidth').value) || 3840;
        height = parseInt(document.getElementById('customHeight').value) || 2160;
    } else {
        [width, height] = resValue.split('x').map(Number);
    }

    // Get frame rate
    let fps;
    const fpsValue = document.getElementById('frameRate').value;
    if (fpsValue === 'custom') {
        fps = parseFloat(document.getElementById('customFps').value) || 24;
    } else {
        fps = parseFloat(fpsValue);
    }

    // Get duration
    const hours = parseInt(document.getElementById('hours').value) || 0;
    const minutes = parseInt(document.getElementById('minutes').value) || 0;
    const seconds = parseInt(document.getElementById('seconds').value) || 0;
    const totalFramesInput = parseInt(document.getElementById('totalFrames').value);

    let totalFrames;
    if (totalFramesInput && totalFramesInput > 0) {
        totalFrames = totalFramesInput;
    } else {
        const totalSeconds = hours * 3600 + minutes * 60 + seconds;
        totalFrames = totalSeconds * fps;
    }

    const totalSeconds = totalFrames / fps;
    const totalMinutes = totalSeconds / 60;
    const totalHours = totalMinutes / 60;

    // Get bitrate
    let bitrate;
    const codecValue = document.getElementById('codec').value;
    
    if (codecValue === 'custom') {
        bitrate = parseFloat(document.getElementById('customBitrate').value) || 100;
    } else {
        bitrate = codecs[codecValue].bitrate;
        
        // Adjust for resolution if needed (for 1080p codecs)
        if (codecs[codecValue].base === '1080p' && (width !== 1920 || height !== 1080)) {
            const pixelRatio = (width * height) / (1920 * 1080);
            bitrate *= pixelRatio;
        }
    }

    // Calculate file size
    const fileSize_MB = (bitrate * totalSeconds) / 8;
    const fileSize_GB = fileSize_MB / 1024;
    const fileSize_TB = fileSize_GB / 1024;

    // Data per minute/hour
    const dataPerMinute_MB = (bitrate * 60) / 8;
    const dataPerHour_GB = (bitrate * 3600) / 8 / 1024;

    // Display results
    let fileSizeStr;
    if (fileSize_GB < 1) {
        fileSizeStr = fileSize_MB.toFixed(2) + ' MB';
    } else if (fileSize_TB < 1) {
        fileSizeStr = fileSize_GB.toFixed(2) + ' GB';
    } else {
        fileSizeStr = fileSize_TB.toFixed(2) + ' TB';
    }

    document.getElementById('fileSize').textContent = fileSizeStr;
    document.getElementById('bitrateDisplay').textContent = bitrate.toFixed(0) + ' Mbps';
    document.getElementById('storageOne').textContent = fileSizeStr;
    document.getElementById('storageThree').textContent = (fileSize_GB * 3).toFixed(2) + ' GB';

    // Detailed breakdown
    const resolutionStr = width + 'x' + height + ' (' + (width * height / 1000000).toFixed(1) + 'MP)';
    document.getElementById('resDisplay').textContent = resolutionStr;
    document.getElementById('fpsDisplay').textContent = fps.toFixed(2) + ' fps';
    document.getElementById('codecDisplay').textContent = codecs[codecValue]?.name || 'Custom';
    
    const durationStr = hours + 'h ' + minutes + 'm ' + seconds + 's (' + totalFrames.toLocaleString() + ' frames)';
    document.getElementById('durationDisplay').textContent = durationStr;
    document.getElementById('totalFramesDisplay').textContent = totalFrames.toLocaleString();
    document.getElementById('bitrateBreakdown').textContent = bitrate.toFixed(0) + ' Mbps';
    document.getElementById('dataPerMinute').textContent = (dataPerMinute_MB / 1024).toFixed(2) + ' GB/min';
    document.getElementById('dataPerHour').textContent = dataPerHour_GB.toFixed(1) + ' GB/hr';

    // Storage recommendations
    const storageRecommendations = document.getElementById('storageRecommendations');
    let recommendation = '';
    
    if (fileSize_GB < 100) {
        recommendation = `For ${fileSizeStr} clip with 3-2-1 backup: 1-2 portable SSDs (~$100-200 each) sufficient.`;
    } else if (fileSize_GB < 1000) {
        recommendation = `For ${fileSizeStr} clip with 3-2-1 backup: Fast SSD for editing, 2x external HDD for backups (~1-2TB each).`;
    } else {
        recommendation = `For ${fileSizeStr} clip with 3-2-1 backup: Professional SSD array + NAS + cloud backup. Consider LTO tape for archival.`;
    }
    
    storageRecommendations.innerHTML = `<p><strong>Recommendation:</strong> ${recommendation}</p>`;

    // Codec comparison at this resolution
    generateCodecComparison(bitrate, totalHours);

    document.getElementById('filesizeResults').style.display = 'block';
    document.getElementById('filesizeResults').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function generateCodecComparison(currentBitrate, hours) {
    const tbody = document.getElementById('codecComparisonBody');
    tbody.innerHTML = '';

    const codecsToCompare = [
        'prores-raw',
        'prores-422-hq',
        'prores-422',
        'dnxhr-hqx',
        'h264'
    ];

    codecsToCompare.forEach(codec => {
        const bitrate = codecs[codec].bitrate;
        const fileSize_GB = (bitrate * hours * 3600) / 8 / 1024;
        
        let quality;
        if (codec.includes('raw')) quality = 'Uncompressed RAW';
        else if (codec.includes('hq') || codec.includes('422-')) quality = 'High';
        else quality = 'Compressed';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${codecs[codec].name}</strong></td>
            <td>${bitrate.toFixed(0)} Mbps</td>
            <td>${fileSize_GB.toFixed(1)} GB</td>
            <td>${quality}</td>
        `;
        tbody.appendChild(row);
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    calculateFileSize();
});
