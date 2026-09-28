/* AI in Motion — Computer Vision track. © Janin A Apurba, CSE, AUST */
module.exports = [
  {
    slug: 'how-computers-see-images', title: 'How Computers See Images', track: 'cv', level: 'Beginner', poster: 1,
    summary: 'To a computer, a picture is a grid of numbers. Zoom into the pixels, read their values and split a colour image into red, green and blue channels.',
    scenes: [
      { kit: 'title', title: 'How Computers See Images', sub: 'Pixels, numbers and channels', track: 'Computer Vision', chapter: 'Introduction', say: 'You see a house, the sun and green hills. A computer sees none of that. It sees a grid of numbers. Computer vision is the science of turning those numbers into understanding.' },
      { kit: 'pixels', chapter: 'Pixels are numbers', say: 'This small image is 32 by 32 pixels. The yellow box zooms into a six by six patch. Each square is one pixel, and the number is its brightness, from zero for black to 255 for white. The whole image is just a table of numbers like these.' },
      { kit: 'pixels', mode: 'rgb', chapter: 'Colour channels', say: 'Colour images store three numbers per pixel: how much red, green and blue light to mix. So a colour image is really three grids stacked together, called channels. A 32 by 32 colour image holds 32 times 32 times 3, which is 3072 numbers.' },
      { kit: 'bullets', head: 'Why vision is hard', items: ['The same object looks different from every angle', 'Lighting, shadows and colour casts change every pixel', 'Objects are partly hidden behind others', 'Cats come in thousands of shapes, sizes and colours'], chapter: 'Why it is hard', say: 'Why is this hard? The same cat photographed from a different angle, in different light, or half hidden behind a sofa, produces completely different numbers. A vision system must see past all that variation.' },
      { kit: 'pipeline', head: 'The main computer vision tasks', steps: ['Classification', 'Detection', 'Segmentation', 'Pose & more'], desc: ['What is in this image? One label for the whole picture.', 'What objects are there, and where? Boxes with labels.', 'Which pixels belong to which object or class?', 'Keypoints, depth, tracking, reading text and much more.'], chapter: 'Main tasks', say: 'The main tasks build on each other. Classification labels the whole image. Detection finds and boxes each object. Segmentation labels every pixel. And there is much more: pose, depth, tracking and reading text.' },
      { kit: 'bullets', style: 'recap', items: ['An image is a grid of numbers', 'Greyscale: one value per pixel (0–255)', 'Colour: three channels — red, green, blue', 'Vision must handle angle, light and occlusion'], chapter: 'Recap', say: 'To recap. Images are grids of numbers. Greyscale uses one value per pixel, colour uses three channels. And vision systems must cope with endless variation in angle, light and occlusion.' }
    ],
    takeaways: ['A digital image is a grid of numbers; each pixel’s brightness is 0–255.', 'Colour images have three channels: red, green and blue.', 'A 32 × 32 colour image contains 3,072 numbers.', 'Viewpoint, lighting and occlusion make recognition difficult.'],
    quiz: [
      { q: 'In an 8-bit greyscale image, what does 255 represent?', a: ['Black', 'White', 'Red'], c: 1, why: '0 is black and 255 is white.' },
      { q: 'How many numbers describe one pixel in a colour (RGB) image?', a: ['1', '3', '255'], c: 1, why: 'One value each for red, green and blue.' },
      { q: 'Which task labels every pixel?', a: ['Classification', 'Segmentation', 'Detection'], c: 1, why: 'Segmentation assigns a class to each pixel.' }
    ],
    read: ['introduction-to-computer-vision', 'image-processing-fundamentals']
  },
  {
    slug: 'convolution-and-image-filters', title: 'Convolution and Image Filters', track: 'cv', level: 'Beginner', poster: 1,
    summary: 'Slide a small grid of numbers over an image, multiply and add. See edge-detection, blur and sharpen filters computed cell by cell.',
    scenes: [
      { kit: 'title', title: 'Convolution', sub: 'The operation at the heart of computer vision', track: 'Computer Vision', chapter: 'Introduction', say: 'Blurring a photo, sharpening it, finding its edges, and even the first layers of deep networks, all use one operation: convolution.' },
      { kit: 'convolve', kernel: 'edge', chapter: 'An edge filter', say: 'The image on the left is dark on the left and bright on the right. The kernel is a three by three grid of numbers. We place it over a patch, multiply each pair of numbers, and add them up. Then slide one step and repeat. The feature map lights up with 27s exactly where dark meets bright: the filter has found the edge.' },
      { kit: 'convolve', kernel: 'blur', head: 'A blur filter', chapter: 'Blur', say: 'Now a blur filter: every weight is one, and we divide by nine, so each output is the average of its neighbourhood. The sharp jump from 0 to 9 becomes a gentle ramp: 0, 3, 6, 9.' },
      { kit: 'convolve', kernel: 'sharpen', head: 'A sharpen filter', chapter: 'Sharpen', say: 'A sharpen filter does the opposite. It boosts the centre pixel and subtracts its neighbours, exaggerating differences. Around the edge we get minus 9 on the dark side and 18 on the bright side, making the edge stand out.' },
      { kit: 'bullets', head: 'Key ideas', items: ['A kernel (filter) is a small grid of weights', 'Output = sum of element-wise products at each position', 'Different kernels detect different patterns', 'In CNNs, the kernel values are learned, not designed by hand'], chapter: 'Key ideas', say: 'The key ideas. A kernel is a small grid of weights. At each position we multiply and sum. Different kernels find different patterns. And in convolutional neural networks, the kernels are learned from data, not designed by hand.' },
      { kit: 'bullets', style: 'recap', items: ['Slide, multiply, add — that is convolution', 'Edge kernels respond to changes in brightness', 'Blur averages; sharpen exaggerates differences', 'CNNs learn their own kernels'], chapter: 'Recap', say: 'To recap. Slide, multiply, add. Edge kernels respond to brightness changes, blur averages, sharpen exaggerates. And CNNs learn their own kernels.' }
    ],
    takeaways: ['Convolution slides a kernel over an image, multiplying and summing at each position.', 'Edge kernels respond strongly where brightness changes (27s at the edge in the demo).', 'Blur averages neighbours (0, 3, 6, 9 ramp); sharpen exaggerates differences.', 'CNNs learn kernel values from data.'],
    quiz: [
      { q: 'What happens at each position in convolution?', a: ['Multiply kernel and image values, then add them up', 'Copy the pixel', 'Sort the pixels'], c: 0, why: 'Each output is a weighted sum.' },
      { q: 'What does a blur kernel with all 1s (÷9) compute?', a: ['The average of the 3 × 3 neighbourhood', 'The maximum value', 'The edge direction'], c: 0, why: 'Equal weights divided by 9 give the mean.' },
      { q: 'In a CNN, where do the kernel values come from?', a: ['They are learned during training', 'They are always hand-designed', 'They are random forever'], c: 0, why: 'Training adjusts the kernels like any other weights.' }
    ],
    read: ['image-processing-fundamentals', 'convolutional-neural-networks-intro']
  },
  {
    slug: 'edge-detection', title: 'Edge Detection with Sobel Filters', track: 'cv', level: 'Beginner', poster: 1,
    summary: 'Edges are where brightness changes quickly. Compute horizontal and vertical gradients with Sobel filters and combine them into an edge map.',
    scenes: [
      { kit: 'title', title: 'Edge Detection', sub: 'Finding where brightness changes', track: 'Computer Vision', chapter: 'Introduction', say: 'Edges outline objects. They are where brightness changes suddenly. Finding them is one of the oldest and most useful steps in computer vision.' },
      { kit: 'edges', chapter: 'Sobel in action', say: 'Start with this simple image. The Sobel filter for horizontal change highlights vertical edges: pink where it gets brighter, blue where it gets darker. The vertical-change filter highlights horizontal edges. Combining the two, using the square root of the sum of squares, gives edge strength in every direction.' },
      { kit: 'equation', head: 'Edge strength', parts: [{ t: '|G|', c: 'amber', note: 'The gradient magnitude: how strong the edge is at this pixel' }, { t: ' = √(' }, { t: 'Gx²', c: 'pink', note: 'Gx: change from left to right' }, { t: ' + ' }, { t: 'Gy²', c: 'cyan', note: 'Gy: change from top to bottom' }, { t: ')' }], below: 'Direction of the edge: θ = atan2(Gy, Gx)', chapter: 'The maths', say: 'At every pixel we have two numbers: Gx, the change from left to right, and Gy, the change from top to bottom. The edge strength is the square root of Gx squared plus Gy squared, and the angle tells us the edge’s direction.' },
      { kit: 'bullets', head: 'From edges to understanding', items: ['Classic pipelines: edges → corners → features (SIFT, HOG)', 'Canny detector: smoothing, gradients, thinning, thresholds', 'Deep networks learn edge-like filters in their first layer', 'Edges help with measurement, OCR and lane detection'], chapter: 'Why edges matter', say: 'Classic computer vision built features like SIFT and HOG on top of edges and corners. The Canny detector refines edges into thin clean lines. And remarkably, deep networks learn edge-like filters in their very first layer on their own.' },
      { kit: 'bullets', style: 'recap', items: ['Edges are rapid brightness changes', 'Sobel filters measure horizontal and vertical change', 'Magnitude √(Gx² + Gy²) gives edge strength', 'CNN first layers learn similar filters automatically'], chapter: 'Recap', say: 'To recap. Edges are rapid changes in brightness. Sobel filters measure them in two directions. Their combined magnitude gives edge strength, and CNNs discover similar filters by themselves.' }
    ],
    takeaways: ['Edges are locations where image brightness changes rapidly.', 'Sobel filters estimate horizontal (Gx) and vertical (Gy) change.', 'Edge strength = √(Gx² + Gy²); direction = atan2(Gy, Gx).', 'CNNs learn edge-like filters in their first layers.'],
    quiz: [
      { q: 'An edge is where…', a: ['Brightness changes quickly', 'Every pixel is black', 'The image ends'], c: 0, why: 'Edges are strong local changes in intensity.' },
      { q: 'How is edge strength computed from Gx and Gy?', a: ['√(Gx² + Gy²)', 'Gx × Gy', 'Gx − Gy'], c: 0, why: 'It is the length of the gradient vector.' },
      { q: 'What do the first layers of trained CNNs often look like?', a: ['Edge and colour detectors', 'Whole-object detectors', 'Random noise forever'], c: 0, why: 'Early layers learn simple local patterns like edges.' }
    ],
    read: ['image-processing-fundamentals', 'classical-features-sift-hog']
  },
  {
    slug: 'convolutional-neural-networks', title: 'Convolutional Neural Networks', track: 'cv', level: 'Intermediate', poster: 1,
    summary: 'Stacks of learned filters, activations and pooling turn pixels into probabilities. Follow data through a CNN and see what each layer learns.',
    scenes: [
      { kit: 'title', title: 'Convolutional Neural Networks', sub: 'How deep learning learned to see', track: 'Computer Vision', chapter: 'Introduction', say: 'Convolutional neural networks, or CNNs, transformed computer vision. They stack learned filters to go from raw pixels to confident predictions.' },
      { kit: 'cnn-arch', chapter: 'Inside a CNN', say: 'Follow the data. A 32 by 32 colour image enters. A convolution layer applies 16 learned filters, producing 16 feature maps. Pooling halves the size. Another convolution makes 32 maps, and pooling shrinks again. The spatial size shrinks while the number of channels grows. Finally the maps are flattened, a dense layer combines them, and softmax gives probabilities.' },
      { kit: 'features-hierarchy', chapter: 'The feature hierarchy', say: 'What does each layer learn? The first layers detect edges and colours. The next combine them into textures and corners. Deeper layers respond to parts like eyes and wheels, and the deepest to whole objects. Nobody programs these features. They emerge during training.' },
      { kit: 'bullets', head: 'Why convolution suits images', items: ['Local connections — each filter looks at a small patch', 'Weight sharing — the same filter scans the whole image', 'Far fewer parameters than a fully connected network', 'Translation — a pattern is found wherever it appears'], chapter: 'Why CNNs work', say: 'Convolution suits images for three reasons. Each filter looks at a small local patch. The same filter is reused across the whole image, so there are far fewer parameters. And a pattern is detected wherever it appears.' },
      { kit: 'classify', chapter: 'Making a prediction', say: 'At the end, the network outputs a score for every class, and softmax turns the scores into probabilities that add up to 100 percent. Here it is 86 percent confident that this image shows a house.' },
      { kit: 'bullets', style: 'recap', items: ['Convolution layers apply learned filters', 'Pooling shrinks feature maps', 'Channels grow while spatial size shrinks', 'Layers learn edges → textures → parts → objects'], chapter: 'Recap', say: 'To recap. Convolution layers learn filters, pooling shrinks the maps, channels grow while size shrinks, and the network builds a hierarchy from edges to whole objects.' }
    ],
    takeaways: ['CNNs stack convolution, activation and pooling layers, then classify.', 'Spatial size shrinks while the number of feature channels grows.', 'Early layers learn edges; deeper layers learn parts and objects.', 'Local connections and weight sharing make CNNs efficient for images.'],
    quiz: [
      { q: 'What does weight sharing mean in a CNN?', a: ['The same filter is applied across the whole image', 'All layers share one weight', 'Weights are shared between users'], c: 0, why: 'One filter scans every position.' },
      { q: 'As data moves deeper into a typical CNN…', a: ['Spatial size shrinks and channels grow', 'Spatial size grows and channels shrink', 'Nothing changes'], c: 0, why: 'Pooling/striding reduce size while more filters add channels.' },
      { q: 'Deeper CNN layers tend to detect…', a: ['More complex parts and objects', 'Only single pixels', 'Only colours'], c: 0, why: 'Features become more abstract with depth.' }
    ],
    read: ['convolutional-neural-networks-intro', 'lenet-and-alexnet', 'explainability-for-vision-grad-cam']
  },
  {
    slug: 'pooling-stride-and-padding', title: 'Pooling, Stride and Padding', track: 'cv', level: 'Beginner', poster: 1,
    summary: 'How CNNs shrink feature maps: max pooling, average pooling, stride and padding — with the numbers computed in front of you.',
    scenes: [
      { kit: 'title', title: 'Pooling, Stride & Padding', sub: 'Controlling the size of feature maps', track: 'Computer Vision', chapter: 'Introduction', say: 'CNNs gradually shrink their feature maps so later layers see a bigger picture with less computation. Pooling, stride and padding control how.' },
      { kit: 'pooling', chapter: 'Max pooling', say: 'Max pooling slides a two by two window with a stride of two, and keeps only the largest value in each window. Six, five, seven and nine. The four by four map becomes two by two: a quarter of the size, keeping the strongest signals.' },
      { kit: 'pooling', mode: 'avg', chapter: 'Average pooling', say: 'Average pooling keeps the mean of each window instead: 3.5, 2, 3.25 and 6.75. It is smoother, and a global version, averaging a whole feature map to one number, is common at the end of modern networks.' },
      { kit: 'bullets', head: 'Stride and padding', items: ['Stride — how far the filter moves each step (stride 2 halves the size)', 'Padding — add a border of zeros so edges are not lost', '“Same” padding keeps the output the same size as the input', 'Output size = (input − kernel + 2·padding) / stride + 1'], chapter: 'Stride and padding', say: 'Stride is how far the filter moves each step. A stride of two roughly halves the output. Padding adds a border of zeros so pixels at the edge are not ignored, and same padding keeps the size unchanged.' },
      { kit: 'equation', head: 'Output size', size: 44, parts: [{ t: 'out', c: 'pink', note: 'Width (or height) of the output feature map' }, { t: ' = ' }, { t: '(n − k + 2p)', c: 'cyan', note: 'n: input size, k: kernel size, p: padding' }, { t: ' / ' }, { t: 's', c: 'amber', note: 's: stride — how far the filter moves each step' }, { t: ' + 1' }], below: 'Example: n = 32, k = 3, p = 1, s = 1 → out = 32', monoBelow: true, chapter: 'Output size', say: 'The output size is n minus k plus two p, divided by the stride, plus one. For a 32 pixel input, a three by three kernel, padding one and stride one, the output stays 32.' },
      { kit: 'bullets', style: 'recap', items: ['Max pooling keeps the strongest value per window', 'Average pooling keeps the mean', 'Stride controls step size; padding protects edges', 'Use the formula to predict output size'], chapter: 'Recap', say: 'To recap. Max pooling keeps the strongest value, average pooling the mean. Stride sets the step and padding protects the edges. And one formula predicts the output size.' }
    ],
    takeaways: ['2 × 2 max pooling with stride 2 keeps the largest value in each window and quarters the map.', 'In the demo: max pooling gives 6, 5, 7, 9; average pooling gives 3.5, 2, 3.25, 6.75.', 'Stride sets how far a filter moves; padding adds a border of zeros.', 'Output size = (n − k + 2p) / s + 1.'],
    quiz: [
      { q: 'What does max pooling keep from each window?', a: ['The largest value', 'The smallest value', 'The first value'], c: 0, why: 'Max pooling keeps the strongest activation.' },
      { q: 'With n = 32, k = 3, p = 1, s = 1, what is the output size?', a: ['30', '32', '16'], c: 1, why: '(32 − 3 + 2) / 1 + 1 = 32.' },
      { q: 'Why add padding?', a: ['So pixels at the image border are not lost', 'To add colour', 'To remove the stride'], c: 0, why: 'Padding lets filters cover edge pixels and controls output size.' }
    ],
    read: ['pooling-stride-padding', 'convolutional-neural-networks-intro']
  },
  {
    slug: 'landmark-cnn-architectures', title: 'Landmark CNNs: From LeNet to ResNet', track: 'cv', level: 'Intermediate', poster: 2,
    summary: 'The architectures that defined deep vision — and how ImageNet top-5 error fell from 28% to under 4% in five years.',
    scenes: [
      { kit: 'title', title: 'Landmark CNN Architectures', sub: 'From LeNet to ResNet and beyond', track: 'Computer Vision', chapter: 'Introduction', say: 'A handful of famous networks shaped modern computer vision. Each one introduced an idea we still use today.' },
      { kit: 'timeline', head: 'A family tree of vision models', events: [['1998', 'LeNet-5 reads handwritten digits'], ['2012', 'AlexNet: deep CNN on GPUs'], ['2014', 'VGG & GoogLeNet: deeper, multi-scale'], ['2015', 'ResNet: 152 layers with skip connections'], ['2017', 'MobileNet: vision on phones'], ['2019', 'EfficientNet: balanced scaling'], ['2020', 'Vision Transformer']], chapter: 'The timeline', say: 'LeNet read handwritten digits in 1998. AlexNet in 2012 showed deep CNNs trained on GPUs could win big. VGG and GoogLeNet went deeper in 2014. ResNet reached 152 layers in 2015. MobileNet brought vision to phones, EfficientNet balanced scaling, and in 2020 the Vision Transformer arrived.' },
      { kit: 'bars', head: 'ImageNet top-5 error of the winning entry', labels: ['2010', '2011', '2012 AlexNet', '2013', '2014 GoogLeNet', '2015 ResNet'], values: [28.2, 25.8, 16.4, 11.7, 6.7, 3.6], suffix: '%', dec: 1, unit: 'top-5 error (%)', ref: { v: 5.1, label: 'estimated human error ≈ 5.1%' }, chapter: 'The ImageNet race', say: 'The ImageNet challenge asked models to recognise a thousand categories. The winning top five error was 28 percent in 2010. AlexNet cut it to 16.4 percent in 2012. By 2015, ResNet reached about 3.6 percent, below one published estimate of human error, around 5 percent.' },
      { kit: 'bullets', head: 'The big ideas', items: ['AlexNet — ReLU, dropout and GPU training', 'VGG — simple stacks of small 3 × 3 filters', 'GoogLeNet — parallel filters at multiple scales', 'ResNet — skip connections make very deep nets trainable', 'MobileNet & EfficientNet — accuracy per unit of compute'], chapter: 'Key ideas', say: 'Each network added an idea. AlexNet used ReLU, dropout and GPUs. VGG stacked small three by three filters. GoogLeNet mixed several filter sizes in parallel. ResNet added skip connections. And MobileNet and EfficientNet optimised accuracy per unit of computation.' },
      { kit: 'gradient-flow', both: true, head: 'Why ResNet could go so deep', chapter: 'ResNet’s trick', say: 'ResNet’s trick was the skip connection. Gradients flow back through shortcut paths instead of fading layer by layer, which made networks with over a hundred layers trainable.' },
      { kit: 'bullets', style: 'recap', items: ['LeNet (1998) → AlexNet (2012) started deep vision', 'Deeper and smarter: VGG, GoogLeNet, ResNet', 'Error on ImageNet fell from 28% to about 3.6%', 'Efficiency and transformers are the next chapters'], chapter: 'Recap', say: 'To recap. LeNet and AlexNet started it. VGG, GoogLeNet and ResNet went deeper and smarter. ImageNet error fell from 28 percent to about 3.6. And efficient networks and transformers are the next chapters.' }
    ],
    takeaways: ['AlexNet’s 2012 ImageNet win (16.4% top-5 error) launched the deep learning era in vision.', 'VGG, GoogLeNet and ResNet pushed depth and design further.', 'ResNet reached about 3.6% top-5 error in 2015 using skip connections.', 'MobileNet and EfficientNet focus on accuracy per unit of compute.'],
    quiz: [
      { q: 'Which network won ImageNet in 2012 and started the deep learning boom?', a: ['LeNet', 'AlexNet', 'ResNet'], c: 1, why: 'AlexNet cut top-5 error to 16.4%.' },
      { q: 'What key idea did ResNet introduce?', a: ['Skip (residual) connections', 'The perceptron', 'Pooling'], c: 0, why: 'Residual connections let very deep networks train.' },
      { q: 'What do MobileNet and EfficientNet prioritise?', a: ['Accuracy per unit of computation', 'Maximum size', 'Hand-written features'], c: 0, why: 'They target efficient models, e.g. for phones.' }
    ],
    read: ['lenet-and-alexnet', 'vgg-and-inception', 'resnet-architecture', 'efficientnet-and-model-scaling', 'mobilenet-efficient-architectures']
  },
  {
    slug: 'image-classification', title: 'Image Classification End to End', track: 'cv', level: 'Beginner', poster: 1,
    summary: 'From a labelled dataset to a trained classifier: the full pipeline, softmax probabilities and how to judge the results.',
    scenes: [
      { kit: 'title', title: 'Image Classification', sub: 'Building a classifier end to end', track: 'Computer Vision', chapter: 'Introduction', say: 'Image classification answers one question: what is in this picture? Let us walk through the whole pipeline, from data to prediction.' },
      { kit: 'classify', chapter: 'Picture to prediction', say: 'An image goes in. A convolutional network extracts features layer by layer. The final layer gives a score for each class, and softmax turns those scores into probabilities: here 86 percent house, 8 percent barn, 4 percent castle and 2 percent tent.' },
      { kit: 'pipeline', head: 'The pipeline', steps: ['Collect & label', 'Split', 'Augment', 'Train', 'Evaluate'], desc: ['Gather images for every class and label them carefully.', 'Keep separate validation and test images.', 'Flip, crop and colour-shift training images to add variety.', 'Usually start from a pretrained network and fine-tune.', 'Check accuracy per class and look at the mistakes.'], chapter: 'The pipeline', say: 'Collect and label images for every class. Split off validation and test sets. Augment the training images for variety. Train, usually by fine-tuning a pretrained network. Then evaluate, class by class, and study the mistakes.' },
      { kit: 'equation', head: 'Softmax', parts: [{ t: 'p(class i)', c: 'green', note: 'The probability the model assigns to class i' }, { t: ' = ' }, { t: 'e^(zᵢ)', c: 'pink', note: 'Exponentiate the score so it is positive' }, { t: ' / ' }, { t: 'Σ e^(zⱼ)', c: 'cyan', note: 'Divide by the total so all probabilities sum to 1' }], chapter: 'Softmax', say: 'Softmax exponentiates each class score so it is positive, then divides by the total so everything sums to one. The largest score gets the largest probability.' },
      { kit: 'bullets', head: 'Common pitfalls', items: ['Class imbalance — 95% of images from one class', 'Shortcut learning — the model uses the background, not the object', 'Data leakage — near-duplicate images in train and test', 'Overconfidence — high probability does not mean correct'], chapter: 'Pitfalls', say: 'Watch for pitfalls. Imbalanced classes. Shortcut learning, where the model looks at the background instead of the object. Near duplicate images leaking into the test set. And overconfidence: a high probability is not a guarantee.' },
      { kit: 'bullets', style: 'recap', items: ['Image → CNN features → class scores → softmax', 'Collect, split, augment, train, evaluate', 'Fine-tuning a pretrained model is the usual start', 'Inspect mistakes and per-class accuracy'], chapter: 'Recap', say: 'To recap. Image, features, scores, softmax. Collect, split, augment, train and evaluate. Start from a pretrained model, and always inspect the mistakes.' }
    ],
    takeaways: ['A classifier maps an image to class probabilities via softmax.', 'The pipeline: collect/label, split, augment, train, evaluate.', 'Fine-tuning a pretrained network is the usual starting point.', 'Beware imbalance, shortcut learning, leakage and overconfidence.'],
    quiz: [
      { q: 'What do softmax outputs add up to?', a: ['1 (100%)', '0', 'The number of classes'], c: 0, why: 'Softmax normalises the scores into a probability distribution.' },
      { q: 'A model recognises cows only when there is grass in the picture. This is…', a: ['Shortcut learning', 'Data augmentation', 'Pooling'], c: 0, why: 'It relies on a spurious background cue.' },
      { q: 'What is usually the best way to start a new image classifier?', a: ['Fine-tune a pretrained network', 'Train a huge network from scratch on 100 images', 'Skip evaluation'], c: 0, why: 'Transfer learning works well with limited data.' }
    ],
    read: ['image-classification-pipeline', 'transfer-learning-fine-tuning', 'softmax-regression-multiclass']
  },
  {
    slug: 'data-augmentation', title: 'Data Augmentation for Vision', track: 'cv', level: 'Beginner', poster: 1,
    summary: 'One image becomes many training examples: flips, rotations, crops, lighting changes and noise teach models what really matters.',
    scenes: [
      { kit: 'title', title: 'Data Augmentation', sub: 'One image, many lessons', track: 'Computer Vision', chapter: 'Introduction', say: 'Labelled images are expensive. Data augmentation creates new training examples from the ones you already have, and it is one of the most effective tricks in computer vision.' },
      { kit: 'augment', chapter: 'Transformations', say: 'Take one image and transform it. Flip it horizontally. Rotate it slightly. Crop a random region. Make it brighter or darker. Add a little noise. The label stays the same: it is still a house. The model learns that these changes do not matter.' },
      { kit: 'bullets', head: 'Why it works', items: ['Teaches invariance — a flipped house is still a house', 'Acts as regularisation — harder to memorise exact pixels', 'Simulates real-world variation — lighting, angle, framing', 'Often worth as much as collecting more data'], chapter: 'Why it works', say: 'Augmentation teaches invariance, the idea that a flipped or darker house is still a house. It makes memorising exact pixels harder, which reduces overfitting. And it simulates the variety of the real world.' },
      { kit: 'compare', head: 'Choose augmentations carefully', left: { title: 'Usually safe', items: ['Horizontal flips for most photos', 'Small rotations and crops', 'Brightness and contrast changes'], color: 'green' }, right: { title: 'Can break the label', items: ['Flipping text or digits (a 6 ≠ a 9)', 'Vertical flips for street scenes', 'Colour changes when colour is the clue'], color: 'red' }, chapter: 'Pitfalls', say: 'Choose augmentations that keep the label true. Horizontal flips suit most photos, but flipping text or digits can change their meaning. Colour changes are harmful if colour is the very thing you are classifying.' },
      { kit: 'bullets', head: 'Advanced techniques', items: ['Cutout — erase random patches', 'Mixup — blend two images and their labels', 'RandAugment — randomly chosen strong augmentations', 'Test-time augmentation — average predictions over variants'], chapter: 'Advanced', say: 'Advanced methods include cutout, which erases random patches, mixup, which blends two images and their labels, and RandAugment, which picks strong augmentations automatically.' },
      { kit: 'bullets', style: 'recap', items: ['Transform images, keep labels', 'Teaches invariance and reduces overfitting', 'Pick transforms that keep the label true', 'Applied on the fly during training'], chapter: 'Recap', say: 'To recap. Transform images but keep their labels. It teaches invariance and reduces overfitting. Pick transforms that keep the label true, and apply them on the fly during training.' }
    ],
    takeaways: ['Augmentation creates varied training images from existing ones.', 'Flips, crops, rotations, lighting changes and noise are common.', 'It teaches invariance and acts as regularisation.', 'Only use transforms that keep the label correct.'],
    quiz: [
      { q: 'Why is flipping handwritten digits risky?', a: ['It can change the meaning (e.g. confusing shapes)', 'It is too slow', 'It deletes the image'], c: 0, why: 'Some transforms change what the label should be.' },
      { q: 'Data augmentation mainly helps to…', a: ['Reduce overfitting and teach invariance', 'Make images smaller', 'Remove labels'], c: 0, why: 'Varied examples make memorisation harder.' },
      { q: 'What does mixup do?', a: ['Blends two images and their labels', 'Rotates by 90°', 'Changes the model architecture'], c: 0, why: 'Mixup trains on weighted blends of examples.' }
    ],
    read: ['data-augmentation-for-vision', 'regularization-in-deep-learning']
  },
  {
    slug: 'transfer-learning-for-vision', title: 'Transfer Learning for Vision', track: 'cv', level: 'Beginner', poster: 1,
    summary: 'Reuse a network trained on millions of images: freeze its layers, add a new head, and fine-tune with only a small dataset of your own.',
    scenes: [
      { kit: 'title', title: 'Transfer Learning', sub: 'Standing on the shoulders of giant networks', track: 'Computer Vision', chapter: 'Introduction', say: 'Training a vision model from scratch needs millions of labelled images. Transfer learning lets you reuse a network that has already learned to see.' },
      { kit: 'transfer', task: 'your 3 classes', chapter: 'Frozen layers and a new head', say: 'Take a network pretrained on ImageNet, over a million images. Its layers already detect edges, textures, parts and objects. Freeze them, remove the original classifier, and add a new head for your own classes. Only the head is trained.' },
      { kit: 'transfer', mode: 'finetune', chapter: 'Fine-tuning', say: 'With a bit more data, unfreeze the last block as well and fine-tune it with a small learning rate. Early layers stay frozen, because edges and textures are useful for almost any task.' },
      { kit: 'compare', head: 'Which strategy?', left: { title: 'Feature extraction', items: ['Freeze the whole backbone', 'Train only the new head', 'Best for very small datasets'], color: 'blue' }, right: { title: 'Fine-tuning', items: ['Unfreeze some top layers', 'Small learning rate', 'Best when you have more data'], color: 'orange' }, chapter: 'Choosing', say: 'With very little data, freeze everything and train only the head. With more data, or data very different from the original, fine-tune some of the top layers too, gently.' },
      { kit: 'bullets', head: 'Tips', items: ['Resize and normalise images like the original training data', 'Use a smaller learning rate for pretrained layers', 'Augment your small dataset', 'Foundation models like CLIP and DINO make strong starting points'], chapter: 'Tips', say: 'Match the preprocessing the network was trained with. Use a small learning rate for pretrained layers. Augment your data. And consider modern foundation models, which make very strong starting points.' },
      { kit: 'bullets', style: 'recap', items: ['Start from a network pretrained on big data', 'Freeze early layers, replace the head', 'Fine-tune top layers when you have more data', 'Great results with small datasets'], chapter: 'Recap', say: 'To recap. Start from a pretrained network. Freeze early layers and add a new head. Fine-tune the top layers when data allows. And get strong results even with small datasets.' }
    ],
    takeaways: ['Transfer learning reuses features learned on large datasets like ImageNet.', 'Feature extraction freezes the backbone and trains only a new head.', 'Fine-tuning unfreezes top layers and uses a small learning rate.', 'It enables strong models from small datasets.'],
    quiz: [
      { q: 'In feature extraction, which part is trained?', a: ['Only the new head', 'Every layer from scratch', 'Nothing'], c: 0, why: 'The pretrained backbone stays frozen.' },
      { q: 'Why keep early layers frozen when fine-tuning?', a: ['Edges and textures are useful for almost any task', 'They cannot be trained', 'They are random'], c: 0, why: 'Low-level features transfer well across tasks.' },
      { q: 'What learning rate is typical for fine-tuning pretrained layers?', a: ['A small one', 'A very large one', 'Zero for all layers'], c: 0, why: 'Small steps avoid destroying useful pretrained features.' }
    ],
    read: ['transfer-learning-fine-tuning', 'self-supervised-vision-simclr-dino-mae', 'clip-vision-language']
  },
  {
    slug: 'object-detection', title: 'Object Detection: Boxes, IoU and NMS', track: 'cv', level: 'Intermediate', poster: 2,
    summary: 'Find every object and draw a box around it. From sliding windows to YOLO-style grids, IoU and non-maximum suppression.',
    scenes: [
      { kit: 'title', title: 'Object Detection', sub: 'What is in the image — and where?', track: 'Computer Vision', chapter: 'Introduction', say: 'Classification says what is in an image. Object detection says what and where: it draws a labelled box around every object.' },
      { kit: 'detection', mode: 'sliding', chapter: 'Sliding windows', say: 'The classic approach slides a window across the image and asks a classifier: is there a car here? The score rises when the window covers a car. But a real image needs thousands of windows at many sizes, which is very slow.' },
      { kit: 'detection', mode: 'yolo', chapter: 'Modern detectors', say: 'Modern detectors like YOLO look once. The image is divided into a grid, and every cell predicts boxes and confidence scores for objects centred in it, all in a single pass. That produces many overlapping candidate boxes. Non-maximum suppression keeps the best box for each object and removes the duplicates.' },
      { kit: 'detection', mode: 'iou', chapter: 'IoU', say: 'How do we measure whether a predicted box is right? Intersection over union: the overlap area divided by the combined area. Zero means no overlap, one means a perfect match. As the prediction slides into place, IoU rises to 0.6, and a common rule counts 0.5 or more as a correct detection.' },
      { kit: 'compare', head: 'Two families of detectors', left: { title: 'Two-stage (R-CNN family)', items: ['First propose regions, then classify them', 'Very accurate', 'Slower'], color: 'violet' }, right: { title: 'One-stage (YOLO, SSD, RetinaNet)', items: ['Predict boxes and classes in one pass', 'Real-time speed', 'Used in cameras, cars and phones'], color: 'amber' }, chapter: 'Detector families', say: 'Two-stage detectors, like Faster R-CNN, first propose regions and then classify them: accurate but slower. One-stage detectors, like YOLO and SSD, predict everything in one pass, fast enough for real-time video.' },
      { kit: 'bullets', style: 'recap', items: ['Detection = class + bounding box for every object', 'Modern detectors predict many boxes in one pass', 'IoU measures box overlap; ≥ 0.5 often counts as correct', 'NMS removes duplicate boxes'], chapter: 'Recap', say: 'To recap. Detection gives a class and a box for every object. Modern detectors predict many boxes at once. IoU measures overlap, and non-maximum suppression removes duplicates.' }
    ],
    takeaways: ['Object detection predicts a class and a bounding box for each object.', 'IoU = overlap area ÷ union area; 0.5 is a common threshold for a correct box.', 'Non-maximum suppression keeps the highest-scoring box and removes overlapping duplicates.', 'One-stage detectors (YOLO, SSD) are fast; two-stage detectors (Faster R-CNN) are very accurate.'],
    quiz: [
      { q: 'What does IoU measure?', a: ['How much two boxes overlap', 'How bright the image is', 'The number of objects'], c: 0, why: 'Intersection over union compares overlap to total area.' },
      { q: 'What is non-maximum suppression for?', a: ['Removing duplicate overlapping boxes', 'Making boxes larger', 'Training faster'], c: 0, why: 'It keeps the best box and suppresses its overlapping neighbours.' },
      { q: 'Why were sliding windows slow?', a: ['They classify thousands of windows at many sizes', 'They need colour images', 'They use too few pixels'], c: 0, why: 'Exhaustive scanning is expensive.' }
    ],
    read: ['yolo-real-time-detection', 'object-detection-rcnn-family', 'ssd-retinanet-focal-loss']
  },
  {
    slug: 'image-segmentation', title: 'Image Segmentation: Every Pixel Labelled', track: 'cv', level: 'Intermediate', poster: 1,
    summary: 'Semantic segmentation labels every pixel by class; instance segmentation separates each object. Plus the U-Net architecture that made it practical.',
    scenes: [
      { kit: 'title', title: 'Image Segmentation', sub: 'A label for every single pixel', track: 'Computer Vision', chapter: 'Introduction', say: 'Boxes are rough. Sometimes we need the exact outline of every object: for self-driving cars, medical scans and photo editing. That is segmentation.' },
      { kit: 'segment', chapter: 'Semantic segmentation', say: 'Semantic segmentation gives every pixel a class: sky, road, car, person or tree. Watch the mask sweep across the scene. Notice that both cars share the same colour, because semantic segmentation only cares about the class, not which car is which.' },
      { kit: 'segment', mode: 'instance', chapter: 'Instance segmentation', say: 'Instance segmentation goes further: each object gets its own mask. Now the two cars are different colours, so we can count them and track them separately. Mask R-CNN is a well-known model for this.' },
      { kit: 'segment', mode: 'unet', chapter: 'U-Net', say: 'Many segmentation networks use an encoder-decoder shape like U-Net. The encoder shrinks the image to understand what is in it. The decoder expands it back to full resolution to say exactly where. Skip connections carry fine details straight across, so boundaries stay sharp.' },
      { kit: 'bullets', head: 'Where segmentation is used', items: ['Medical imaging — outline tumours and organs', 'Self-driving — drivable road, lanes and pedestrians', 'Photo editing — background removal and portrait mode', 'Agriculture and satellites — crops, buildings, water'], chapter: 'Applications', say: 'Segmentation outlines tumours in medical scans, finds drivable road for self-driving cars, powers portrait mode and background removal, and maps crops and buildings from satellite images.' },
      { kit: 'bullets', style: 'recap', items: ['Semantic: one class per pixel', 'Instance: a separate mask per object', 'Encoder–decoder (U-Net) with skip connections', 'Measured with IoU per class'], chapter: 'Recap', say: 'To recap. Semantic segmentation labels pixels by class. Instance segmentation separates objects. Encoder-decoder networks like U-Net do the work, and we measure quality with IoU per class.' }
    ],
    takeaways: ['Semantic segmentation assigns a class to every pixel.', 'Instance segmentation also separates individual objects of the same class.', 'U-Net uses an encoder, a decoder and skip connections for sharp masks.', 'Applications include medical imaging, driving and photo editing.'],
    quiz: [
      { q: 'In semantic segmentation, two cars are…', a: ['Given the same “car” label', 'Always ignored', 'Given different labels automatically'], c: 0, why: 'Semantic segmentation labels classes, not instances.' },
      { q: 'What do U-Net’s skip connections carry?', a: ['Fine spatial detail from encoder to decoder', 'The final labels', 'Random noise'], c: 0, why: 'They help the decoder place boundaries precisely.' },
      { q: 'Which task lets you count individual people in a crowd from masks?', a: ['Instance segmentation', 'Classification', 'Semantic segmentation only'], c: 0, why: 'Each person gets a separate mask.' }
    ],
    read: ['semantic-segmentation-fcn-unet', 'instance-segmentation-mask-rcnn', 'segment-anything-vision-foundation-models', 'medical-imaging-ai']
  },
  {
    slug: 'vision-transformers', title: 'Vision Transformers: Images as Patches', track: 'cv', level: 'Intermediate', poster: 1,
    summary: 'Cut an image into patches, treat them like words and let a Transformer attend between them. How ViTs work and when they beat CNNs.',
    scenes: [
      { kit: 'title', title: 'Vision Transformers', sub: 'An image is worth 16 × 16 words', track: 'Computer Vision', chapter: 'Introduction', say: 'Transformers conquered language. In 2020, researchers asked: what if we treat an image like a sentence? The result was the Vision Transformer, or ViT.' },
      { kit: 'vit', chapter: 'Patches become tokens', say: 'The image is cut into a grid of patches. Each patch is flattened and turned into an embedding, just like a word. A position number is added so the model knows where each patch came from, plus a special classification token. The Transformer then lets every patch attend to every other patch, and the classification token gives the answer.' },
      { kit: 'compare', head: 'CNN vs Vision Transformer', left: { title: 'CNN', items: ['Built-in assumptions: locality, translation', 'Works well with less data', 'Efficient on small devices'], color: 'cyan' }, right: { title: 'Vision Transformer', items: ['Global attention from the first layer', 'Shines with very large datasets or pre-training', 'Scales well; basis of many foundation models'], color: 'violet' }, chapter: 'CNNs vs ViTs', say: 'CNNs build in assumptions about local patterns, so they learn well from less data. Vision transformers have fewer built-in assumptions and see the whole image from the first layer. They shine when pre-trained on huge datasets, and they power many of today’s vision foundation models.' },
      { kit: 'attention', mode: 'matrix', head: 'Patches attending to patches', words: ['CLS', 'P1', 'P2', 'P3', 'P4', 'P5', 'P6'], sub: 'illustrative weights', chapter: 'Attention', say: 'Inside, it is the same attention we saw for words. Each patch builds its understanding by weighing every other patch, so distant parts of the image can inform each other directly.' },
      { kit: 'bullets', head: 'Beyond classification', items: ['CLIP — matches images with text descriptions', 'DINO & MAE — self-supervised pre-training', 'Segment Anything — promptable segmentation', 'Multimodal models — vision + language assistants'], chapter: 'Foundation models', say: 'Vision transformers underpin CLIP, which connects images and text, self-supervised methods like DINO and MAE, promptable segmentation like Segment Anything, and multimodal assistants that can discuss images.' },
      { kit: 'bullets', style: 'recap', items: ['Split the image into patches', 'Embed patches + positions, add a CLS token', 'Transformer attention between all patches', 'Great with large-scale pre-training'], chapter: 'Recap', say: 'To recap. Split into patches, embed them with positions, add a classification token, and let attention do the rest. Vision transformers shine with large-scale pre-training.' }
    ],
    takeaways: ['ViTs split an image into patches and treat them as tokens.', 'Position embeddings and a [CLS] token are added before the Transformer.', 'Every patch can attend to every other patch from the first layer.', 'ViTs excel with large-scale pre-training and underpin many foundation models.'],
    quiz: [
      { q: 'In a ViT, what plays the role of words?', a: ['Image patches', 'Single pixels', 'Colour channels'], c: 0, why: 'Each patch becomes one token.' },
      { q: 'Why are position embeddings added?', a: ['So the model knows where each patch came from', 'To make patches brighter', 'To remove attention'], c: 0, why: 'Attention alone ignores order and position.' },
      { q: 'When do ViTs typically outperform CNNs?', a: ['With very large datasets or pre-training', 'With tiny datasets and no pre-training', 'Never'], c: 0, why: 'Fewer built-in assumptions need more data.' }
    ],
    read: ['vision-transformers', 'clip-vision-language', 'self-supervised-vision-simclr-dino-mae', 'multimodal-models']
  },
  {
    slug: 'pose-estimation', title: 'Human Pose Estimation', track: 'cv', level: 'Intermediate', poster: 1,
    summary: 'Find a person’s joints — shoulders, elbows, knees — and connect them into a skeleton that can be tracked over time.',
    scenes: [
      { kit: 'title', title: 'Human Pose Estimation', sub: 'Finding the body’s keypoints', track: 'Computer Vision', chapter: 'Introduction', say: 'Fitness apps count your squats, games follow your dance moves, and sports analysts study athletes’ movements. All of them use pose estimation.' },
      { kit: 'pose', chapter: 'Heatmaps to skeleton', say: 'The network first predicts a heatmap for every joint: a glowing blob showing where the left elbow, right knee and so on are likely to be. The peak of each heatmap becomes a keypoint. Connecting the keypoints gives a skeleton, which can be tracked frame by frame as the person moves.' },
      { kit: 'compare', head: 'Two strategies for many people', left: { title: 'Top-down', items: ['Detect each person first', 'Estimate pose inside each box', 'Accurate, slower in crowds'], color: 'cyan' }, right: { title: 'Bottom-up', items: ['Find all keypoints in the image', 'Group them into people', 'Speed stays steady in crowds'], color: 'pink' }, chapter: 'Many people', say: 'With several people, top-down methods first detect each person, then estimate their pose: accurate, but slower as crowds grow. Bottom-up methods find all the joints first and then group them into people.' },
      { kit: 'bullets', head: 'Applications and care', items: ['Fitness and physiotherapy — count reps, check form', 'Sports analysis and animation — capture movement', 'Accessibility — gesture and sign-language interfaces', 'Privacy — body data is personal; ask for consent'], chapter: 'Applications', say: 'Pose estimation helps fitness and physiotherapy apps, sports analysis, animation and gesture interfaces. But body movement is personal data, so use it with consent and care.' },
      { kit: 'bullets', style: 'recap', items: ['Predict a heatmap per joint', 'Heatmap peaks become keypoints', 'Connect keypoints into a skeleton', 'Top-down or bottom-up for multiple people'], chapter: 'Recap', say: 'To recap. Predict heatmaps, pick their peaks as keypoints, connect them into a skeleton, and choose top-down or bottom-up for multiple people.' }
    ],
    takeaways: ['Pose estimation locates body keypoints such as shoulders, elbows and knees.', 'Networks often predict a heatmap per joint; its peak gives the keypoint.', 'Keypoints are connected into a skeleton and tracked over time.', 'Top-down detects people first; bottom-up finds joints first and groups them.'],
    quiz: [
      { q: 'What does a keypoint heatmap show?', a: ['Where a particular joint is likely to be', 'The temperature of the person', 'The image brightness'], c: 0, why: 'Each heatmap scores possible locations for one joint.' },
      { q: 'Top-down pose estimation first…', a: ['Detects each person', 'Finds all joints in the image', 'Segments the sky'], c: 0, why: 'It estimates poses inside detected person boxes.' },
      { q: 'Why should pose data be handled carefully?', a: ['Body movement is personal data', 'It is always inaccurate', 'It needs colour images'], c: 0, why: 'Privacy and consent matter.' }
    ],
    read: ['human-pose-estimation', 'video-understanding']
  }
];
