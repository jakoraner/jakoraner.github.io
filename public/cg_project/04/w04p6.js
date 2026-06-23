/**
 * Task w04p6: Shading and Lighting Concepts
 *
 * Answer the following questions:
 *
 * a) What is the difference between Phong shading and Phong lighting (the Phong reflection model)?
 *
 * 
 * - **Phong Lighting (Phong Reflection Model):**
 *   - It is a mathematical model that describes how light interacts with a surface to produce color and shading.
 *   - Comprises three components: Ambient, Diffuse, and Specular reflections.
 *   - Calculates the color of a point on a surface based on the light's properties, the material's properties, and the geometry of the scene.
 *   - Primarily concerned with the illumination and color calculation.
 * 
 * - **Phong Shading:**
 *   - A shading technique that applies the Phong Reflection Model at every pixel (fragment) rather than at vertices.
 *   - Interpolates normals across the surface of a polygon and performs lighting calculations per fragment.
 *   - Produces smoother and more accurate lighting effects, especially for specular highlights, compared to Gouraud shading.
 * 
 * **Summary:**
 * Phong Lighting refers to the reflection model used to calculate lighting effects, while Phong Shading is the rendering technique that applies this model per pixel for enhanced visual quality.
 * 
 * ---
 * 
 * b) What is the difference between flat shading, Gouraud shading, and Phong shading? List pros and cons of each. Is Gouraud or Phong shading the best method for simulating highlights? Explain.
 *
 * **Answer:**
 * 
 * - **Flat Shading:**
 *   - **Description:** Computes lighting once per polygon (face) using a single normal vector, and applies the same color to all pixels of the polygon.
 *   - **Pros:**
 *     - Simple and fast to compute.
 *     - Low computational overhead.
 *     - Suitable for low-polygon models where a faceted look is desired.
 *   - **Cons:**
 *     - Results in a faceted appearance with sharp edges between polygons.
 *     - Lacks smooth transitions and realistic lighting.
 * 
 * - **Gouraud Shading:**
 *   - **Description:** Computes lighting at each vertex using the vertex normals, then interpolates the colors across the polygon's surface.
 *   - **Pros:**
 *     - Produces smooth color transitions across surfaces.
 *     - More efficient than per-pixel shading (like Phong) since lighting calculations are done per vertex.
 *   - **Cons:**
 *     - Can miss specular highlights if they do not align with vertices.
 *     - Less accurate lighting for complex lighting interactions.
 * 
 * - **Phong Shading:**
 *   - **Description:** Interpolates normals across the polygon's surface and computes lighting per pixel (fragment).
 *   - **Pros:**
 *     - Produces highly realistic and smooth lighting, including accurate specular highlights.
 *     - Better at handling complex lighting and surface details.
 *   - **Cons:**
 *     - More computationally intensive than Gouraud shading.
 *     - Can be slower, especially on hardware with limited fragment processing capabilities.
 * 
 * - **Best Method for Simulating Highlights:**
 *   - **Phong Shading** is generally the better method for simulating highlights because it calculates specular reflections per pixel, allowing for precise and sharp specular highlights that Gouraud shading might miss if they don't align with vertices.
 * 
 * ---
 * 
 * c) What is the difference between a directional light and a point light?
 *
 * **Answer:**
 * 
 * - **Directional Light:**
 *   - **Definition:** A light source that has parallel light rays, implying that it is infinitely far away.
 *   - **Characteristics:**
 *     - No attenuation (light intensity does not decrease with distance).
 *     - Uniform light direction across the entire scene.
 *     - Simulates sources like the sun, where light rays are effectively parallel.
 *   - **Usage:** Best for large-scale lighting where the light source's position does not significantly affect the lighting direction on objects.
 * 
 * - **Point Light:**
 *   - **Definition:** A light source that emits light uniformly in all directions from a single point in space.
 *   - **Characteristics:**
 *     - Attenuates with distance (light intensity decreases as the distance from the source increases).
 *     - Light direction varies across the scene based on the light's position relative to objects.
 *     - Simulates sources like light bulbs or candles.
 *   - **Usage:** Suitable for localized lighting effects where the position of the light source significantly influences the appearance of objects.
 * 
 * **Summary:**
 * Directional lights provide consistent lighting direction and intensity across the scene without attenuation, ideal for simulating sunlight. Point lights offer localized lighting with varying intensity and direction, suitable for sources like lamps or candles.
 * 
 * ---
 * 
 * d) Does the eye position influence the shading of an object in any way?
 *
 * **Answer:**
 * 
 * - **Yes**, the eye (or camera) position significantly influences the shading of an object, especially in models like the Phong Reflection Model.
 * 
 * - **Influence on Shading Components:**
 *   - **Specular Reflection:** The direction from which the viewer observes the object affects the appearance and intensity of specular highlights. The specular component depends on the angle between the viewer's direction and the reflection direction of the light.
 *   - **View Direction:** Calculations involving the view vector (\( \mathbf{V} \)) are essential for determining how light interacts with the surface relative to the viewer.
 * 
 * - **Practical Implications:**
 *   - Moving the camera changes the view direction, which in turn alters the perceived brightness and sharpness of specular highlights.
 *   - In Phong shading, since lighting calculations are done per pixel, the eye position affects the halfway vector (\( \mathbf{H} \)) and the view vector (\( \mathbf{V} \)), thereby influencing the final color.
 * 
 * **Conclusion:**
 * The eye position plays a crucial role in shading calculations by determining the view direction, which directly affects the appearance of specular highlights and overall shading on the object.
 * 
 * ---
 * 
 * e) What is the effect of setting the specular term to (0, 0, 0)?
 *
 * **Answer:**
 * 
 * - **Specular Term (\( k_s \)):**
 *   - Represents the specular reflection coefficient, controlling the intensity of specular highlights on a surface.
 * 
 * - **Setting Specular Term to (0, 0, 0):**
 *   - **Effect:**
 *     - Eliminates the specular reflection component from the final color calculation.
 *     - Removes all specular highlights, resulting in a surface that lacks shininess.
 *     - The object will only display ambient and diffuse reflections.
 * 
 * - **Visual Outcome:**
 *     - The surface appears matte or dull, with no shiny spots where light directly reflects toward the viewer.
 *     - Enhances the perception of a non-glossy, rough material.
 * 
 * - **Use Cases:**
 *     - Useful for rendering materials that are inherently non-reflective, such as chalk, matte paint, or rough stone.
 * 
 * **Conclusion:**
 * By setting the specular term to zero, you effectively disable shiny highlights, making the object's appearance purely dependent on ambient and diffuse lighting, suitable for matte or rough materials.
 * 
 * ---
 * 
 * f) What is the effect of increasing the shininess exponent (𝛼)?
 *
 * **Answer:**
 * 
 * - **Shininess Exponent (\( \alpha \)):**
 *   - Controls the concentration and sharpness of specular highlights in the Phong Reflection Model.
 * 
 * - **Effect of Increasing \( \alpha \):**
 *   - **Specular Highlights Become Sharper and Smaller:**
 *     - Higher values of \( \alpha \) result in specular highlights that are more concentrated and have a smaller area.
 *     - Simulates highly polished or glossy surfaces where reflections are tight and intense.
 * 
 *   - **Increased Visual Contrast:**
 *     - Sharper highlights enhance the perception of smoothness and reflectivity on the surface.
 * 
 *   - **Less Diffusion:**
 *     - Highlights do not spread out as much, making the material appear more lustrous.
 * 
 * - **Visual Outcome:**
 *     - Surfaces with high \( \alpha \) values exhibit bright, sharp specular spots that stand out prominently against the diffuse shading.
 *     - Examples include metals, glass, and other shiny materials.
 * 
 * - **Trade-Off:**
 *     - While increasing \( \alpha \) enhances shininess, excessively high values can lead to unrealistic or overly harsh highlights.
 * 
 * **Conclusion:**
 * Increasing the shininess exponent sharpens and intensifies specular highlights, making materials appear glossier and more reflective. It is essential to balance \( \alpha \) to achieve realistic lighting without introducing unnatural artifacts.
 * 
 * ---
 * 
 * g) In what coordinate space did you compute the lighting?
 *
 * **Answer:**
 * 
 * - **Coordinate Space Used for Lighting Calculations:**
 *     - **Eye Space (View Space):**
 *         - All lighting calculations are performed in eye space, also known as view space.
 *         - Transformation:
 *             - Vertex positions and normals are transformed from world space to eye space using the model-view matrix.
 *             - The light direction is also transformed to eye space to maintain consistency in calculations.
 * 
 * - **Reasons for Using Eye Space:**
 *     - **Consistency:** Ensures that all vectors (normals, light directions, view directions) are in the same coordinate space, simplifying calculations.
 *     - **Camera-Based Calculations:** Facilitates calculations that depend on the camera's position and orientation, such as the view direction.
 *     - **Simplifies Shader Logic:** Avoids the need to pass additional transformation matrices or perform multiple transformations within shaders.
 * 
 * - **Implementation Details:**
 *     - **Normals:** Transformed to eye space using the normal matrix (derived from the model-view matrix).
 *     - **Light Direction:** Converted to eye space by applying the model-view matrix to the light direction vector.
 *     - **View Direction:** Calculated based on the camera's position in eye space (typically the origin).
 * 
 * **Conclusion:**
 * Lighting computations are conducted in eye space to maintain consistency across all vectors involved in the lighting calculations, ensuring accurate and realistic shading effects relative to the camera's perspective.
 */