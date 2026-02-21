/**
 * ZzFX - Zuper Zmall Zound Zynth version 1.3.1 by Frank Force
 * Modified and strictly typed for TypeScript and ES Modules.
 */

// ZzFX Micro Engine
const zzfxR = 44100;

export const zzfxP = (...params: number[]) => {
    const b = zzfxG(...params);
    const audioContent = new AudioContext();
    const buffer = audioContent.createBuffer(1, b.length, zzfxR);
    buffer.getChannelData(0).set(b);
    const source = audioContent.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContent.destination);
    source.start();
    return source;
};

export const zzfxG = (
    volume = 1, randomness = .05, frequency = 220, attack = 0, sustain = 0, release = .1,
    shape = 0, shapeCurve = 1, slide = 0, deltaSlide = 0, pitchJump = 0, pitchJumpTime = 0,
    repeatTime = 0, noise = 0, modulation = 0, bitCrush = 0, delay = 0, sustainVolume = 1,
    decay = 0, tremolo = 0, tremoloTime = 0
): number[] => {
    const PI2 = Math.PI * 2;
    const sign = (v: number) => v > 0 ? 1 : -1;

    let currentSlide = slide * 500 * PI2 / zzfxR / zzfxR;
    const startSlide = currentSlide;

    let currentFrequency = frequency * (1 + randomness * 2 * Math.random() - randomness) * PI2 / zzfxR;
    const startFrequency = currentFrequency;

    const b: number[] = [];
    let t = 0;

    let fmPhase = 0;
    let phase = 0;
    let c = 0;

    const totalRelease = attack + decay + sustain + release + delay || 0;

    for (; c < totalRelease * zzfxR; c++) {
        const time = c / zzfxR;
        const env = time < attack ? time / attack :
            time < attack + decay ? 1 - ((time - attack) / decay) * (1 - sustainVolume) :
                time < attack + decay + sustain ? sustainVolume :
                    time < totalRelease - delay ? (totalRelease - time - delay) / (totalRelease - attack - decay - sustain - delay) * sustainVolume : 0;

        const sTime = time - delay;
        let s: number = delay ? b[(c - delay * zzfxR) | 0] || 0 : 0;

        if (sTime > 0) {
            fmPhase += modulation * Math.PI / zzfxR * startFrequency * Math.sin(phase * pitchJumpTime);
            phase += currentFrequency + Math.sin(fmPhase) * currentSlide;
            currentSlide += deltaSlide * 500 * PI2 / zzfxR / zzfxR / zzfxR;
            currentFrequency += currentSlide;

            if (repeatTime && ++t > repeatTime * zzfxR) {
                currentFrequency = startFrequency; currentSlide = startSlide; t = 0;
            }
            s = Math.sin(phase);
            s = shape ? shape > 1 ? shape > 2 ? s % 1 : Math.round(s) : sign(s) : s;
            s = (s - bitCrush * Math.sin(phase * noise)) * (1 - tremolo + tremolo * Math.sin(PI2 * tremoloTime * sTime));
            s = env * volume * Math.cos(s * shapeCurve * PI2);
            if (Math.abs(s) > 1) s = sign(s); // Clip
        }
        b[c] = s;
    }
    return b;
};
