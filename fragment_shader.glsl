#ifdef GL_ES
precision mediump float;
#endif

/*
  Eperimental file. Unused.
*/

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

float rectangle(vec2 v, float t){
    vec2 bl = step(vec2(t), v);
    vec2 tr = step(vec2(t), 1.0-v);
    return bl.x * bl.y * tr.x * tr.y;
}
float rectangle2(vec2 v, float t){
    vec2 bl = step(vec2(-t), v);
    vec2 tr = step(vec2(-t), v*-1.0);
    return bl.x * bl.y * tr.x * tr.y;
}
float outline(vec2 v, float t){
    return 1.0-rectangle(v, t);
}
float rectangle_smooth(vec2 v){
    vec2 bl = smoothstep(vec2(0.1), vec2(0.3), v);
    vec2 tr = smoothstep(vec2(0.1), vec2(0.3), 1.0-v);
    return bl.x * bl.y * tr.x * tr.y;
}
float cross(vec2 v){
    vec2 f = step(vec2(-0.03), v);
    vec2 b = step(vec2(-0.03), -1.0*v);
    return f.x * b.x + f.y * b.y;
}
vec2 grid(vec2 v){
    v = v*10.;
    vec2 mod = abs(mod(v, vec2(1.))-.5)*2.;
    mod = smoothstep(vec2(0.2), vec2(0.3), mod);
    return mod;
}
vec2 grid2(vec2 v) {
    v = v * 100.;
    vec2 mod = (cos(v)+1.)*.5;
    return smoothstep(vec2(.2), vec2(.3), mod);
}

void main(){
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    vec3 color = vec3(0.0);

    // bottom-left
    // vec2 bl = step(vec2(0.1,0.3),st);
    // vec2 bl = smoothstep(vec2(0.0), vec2(0.5),st);
    vec2 bl = floor(st);
    float pct = bl.x * bl.y;

    // top-right
    // vec2 tr = step(vec2(0.1,0.3),1.0-st);
    // vec2 tr = smoothstep(vec2(0.0), vec2(0.5),1.0-st);
    vec2 tr = floor(1.0-st);
    pct *= tr.x * tr.y;

    // color = vec3(pct);
    // color = vec3(rectangle(st));
    st = st*2.0-1.0;
    vec2 grid = grid2(st);
    float r = cross(st);
    r += cross(vec2(st.x+.4, st.y));
    r += cross(vec2(st.x+.8, st.y));
    r += cross(vec2(st.x-.4, st.y));
    r += cross(vec2(st.x-.8, st.y));
    r += rectangle2(st/2., 0.1);
    r += rectangle2(vec2(st.x-.4, st.y), 0.1);
    r += rectangle2(vec2(st.x-.8, st.y), 0.1);
    r += rectangle2(vec2(st.x+.4, st.y), 0.1);
    r += rectangle2(vec2(st.x+.8, st.y), 0.1);
    st.x = st.x+1.0;
    float g = rectangle(st, 0.2);
    st.x = st.x-1.0;
    float b = rectangle(st, 0.2);
    st.y = st.y+1.0;
    b += rectangle(st, 0.2);
    st.x = st.x+1.0;
    b += rectangle(st, 0.2);
    // color = vec3(cross(st));
    gl_FragColor = vec4(grid.x*grid.y, 0.0, 0.0, 1.0);
}
