// import SharedBench from './shared-bench';
import Component from 'ember-glimmer/ember-views/component';
import dataGen from '../../utils/data-gen';
import computed from 'ember-metal/computed';
import { bool, equal, and, or, not } from 'ember-metal/computed_macros';
import alias from 'ember-metal/alias';
import { get } from 'ember-metal/property_get';
import Benchmark from '../../utils/benchmarks';
import Mixin from 'ember-metal/mixin';

import Templates from './templates/glimmer';

function endTrace() {
  // just before paint
  requestAnimationFrame(function () {
    // after paint
    requestAnimationFrame(function () {
      // document.location.href = "about:blank";
    });
  });
}

export default Benchmark.create('@ember-glimmer initial render', {
  setup() {
    this.disallowRuntimeCompilation = true;

    const FeedGenericUpdate = Component.extend({
      componentType: computed(function() {
        return `voy-${this.get('model.type')}`;
      }),
      componentClassNames: computed(function() {
        return `update-${this.get('model.type')}`;
      })
    });

    let registerComponent = (name, { ComponentClass }) => {
      this.registerComponent(name, { ComponentClass, template: Templates[name] });
    };

    registerComponent('feed-generic-update', { ComponentClass: FeedGenericUpdate });

    const FollowButton = Component.extend({
      tagName: 'button',
      click() {
        this.attrs.toggleFollow();
      }
    });

    registerComponent('follow-button', { ComponentClass: FollowButton });

    const actorModelToRoute = {
      'entities/shared/mini-company': {
        route: 'entities-company',
        title: 'company_actor'
      },
      'entities/shared/mini-school': {
        route: 'entities-school',
        title: 'school_actor'
      },
      'identity/shared/mini-profile': {
        route: 'profile.view',
        title: 'member_actor'
      }
    };

    const containsURLRegex = /https?:\S+/;

    const VoyMainContent = Component.extend({
      annotatedText: computed(function() {
        let textValues = this.get('text.values');

        if (!textValues) {
          return [];
        }

        let annotatedText = [];

        for (let i = 0; i < textValues.length; i++) {
          let annotatedString = textValues.objectAt(i);
          let value = get(annotatedString, 'value');

          // Converts links in the text to actual links
          let url = containsURLRegex.exec(value);
          if (url) {
            // Push plain text ("check out") onto stack
            if (url.index) {
              annotatedText.push({value: value.substr(0, url.index)});
            }

            // Push the URL onto the stack
            annotatedText.push({
              value: url[0],
              url: url[0]
            });

            value = value.substr(url.index + url[0].length);

            // Push the remaining plain text, if any
            if (value) {
              annotatedText.push({value});
            }
          } else {
            let result = {
              id: get(annotatedString, 'entity.id'),
              value: value,
              route: null,
              title: null
            };

            let entityData = actorModelToRoute[get(annotatedString, 'entity.name')];
            if (entityData) {
              result.route = entityData.route;
              result.title = entityData.title;
            }
            annotatedText.push(result);
          }
        }

        return annotatedText;
      })
    });

    registerComponent('voy-main-content', { ComponentClass: VoyMainContent });

    const VoyHero = Component.extend({
      hasTitle: bool('content.title'),
      hasSubtitle: bool('content.subtitle'),
      shouldShowContent: or('hasTitle', 'hasSubtitle'),
      noHeroImage: not('content.image'),
      isArticle: equal('content.contentType', 'article'),
      isImage: equal('content.contentType', 'image'),
      isVideo: equal('content.contentType', 'video')
    });

    registerComponent('voy-hero', { ComponentClass: VoyHero });

    const VoyHeroDesc = Component.extend({});

    registerComponent('voy-hero-desc', { ComponentClass: VoyHeroDesc });

    const InlineShowMore = Component.extend({});

    registerComponent('inline-show-more-text', { ComponentClass: InlineShowMore });

    const VoyLikeBtn = Component.extend({});

    registerComponent('voy-like-btn', { ComponentClass: VoyLikeBtn });

    const VoyCommentBtn = Component.extend({});

    registerComponent('voy-comment-btn', { ComponentClass: VoyCommentBtn });

    const VoyReshareBtn = Component.extend({});

    registerComponent('voy-reshare-btn', { ComponentClass: VoyReshareBtn });

    const VoySocialCounts = Component.extend({});

    registerComponent('voy-social-counts', { ComponentClass: VoySocialCounts });

    const SvgIcon = Component.extend({});

    registerComponent('svg-icon', { ComponentClass: SvgIcon });

    const VoyActionBar = Component.extend({
      actions: {
        like(id, update) {
          this.sendAction(this.get('like'), id, update);
        }
      }
    });

    registerComponent('voy-action-bar', { ComponentClass: VoyActionBar });

    const VoyNoHero = Component.extend({});

    registerComponent('voy-no-hero', { ComponentClass: VoyNoHero });

    const VoyCustomImage = Component.extend();

    registerComponent('voy-custom-image', { ComponentClass: VoyCustomImage });

    const VoyLazyImage = Component.extend();

    registerComponent('voy-lazy-image', { ComponentClass: VoyLazyImage });

    const VoyAvatarImage = Component.extend();

    registerComponent('voy-avatar-image', { ComponentClass: VoyAvatarImage });

    const VoyPostMeta = Component.extend({
      hideFollowInterface: false,
      showFollowing: computed('isFollowing', 'hideFollowInterface', function() {
        //Only companies and schools should show the "Following" headline
        return !this.get('hideFollowInterface') && this.get('isFollowing');
      }),
      viralLike: equal('model.viralType', 'like'),
      viralComment: equal('model.viralType', 'comment'),
      isFollowing: bool('actor.followingInfo.following'),

      showDate: computed('model.createdTime', 'showFollowing', function() {
        return !this.get('showFollowing') && this.get('model.createdTime');
      })
    });

    registerComponent('voy-post-meta', { ComponentClass: VoyPostMeta });

    const VoyTopBar = Component.extend({
      classNames: ['top-bar'],
      sponsoredDisplayFormat: alias('model.tracking.sponsoredTracking.supportedDisplayFormat'),
      sponsoredLabelTopBar: equal('sponsoredDisplayFormat', 'fssu_vmobile_sulabel_topbar')
    });

    registerComponent('voy-top-bar', { ComponentClass: VoyTopBar });

    const genericMixin = Mixin.create({
      tagName: 'article',
      classNames: ['artdeco-container-card'],
      hasComments: or('model.socialDetail.comments.elements.length'),
      hasHighlightedComment: bool('model.highlightedComments.length'),
      showCommentsList: computed('hasComments', 'hasHighlightedComment', 'isDetailView', function() {
        return (this.get('isDetailView') && this.get('hasComments')) || (!this.get('isDetailView') && this.get('hasHighlightedComment'));
      })
    });

    const VoyViralUpdate = Component.extend(genericMixin,{
      hasImage: bool('model.content.image'),
      isShareVideo: equal('model.type', 'video'),
      isShareVideoImage: and('isShareVideo', 'hasImage'),
      isShareArticleImage: and('isShareArticle', 'hasImage'),
      hasHeroEntity: or('hasImage', 'isShareArticle', 'isShareVideoImage'),
      displayImageDescription: or('isShareArticle', 'isShareVideoImage'),
      noHeroImage: computed('hasImage', 'isShareArticle', 'isShareVideoImage', function() {
        return ((this.get('isShareArticle') && !this.get('hasImage')) || (this.get('isShareVideoImage') && !this.get('hasImage')));
      }),
      displayContentBlock: or('hasHeroEntity', 'noHeroImage', 'displayImageDescription', 'model.type'),
      actions: {
        like() {
          this.sendAction(this.get('likeAction'));
        }
      }
    });

    const VoyProfileUpdate = Component.extend(genericMixin, {
      hasImage: bool('model.content.image'),
      isShareVideo: equal('model.type', 'video'),
      isShareVideoImage: and('isShareVideo', 'hasImage'),
      isShareArticleImage: and('isShareArticle', 'hasImage'),
      hasHeroEntity: or('hasImage', 'isShareArticle', 'isShareVideoImage'),
      displayImageDescription: or('isShareArticle', 'isShareVideoImage'),
      noHeroImage: computed('hasImage', 'isShareArticle', 'isShareVideoImage', function() {
        return ((this.get('isShareArticle') && !this.get('hasImage')) || (this.get('isShareVideoImage') && !this.get('hasImage')));
      }),
      displayContentBlock: or('hasHeroEntity', 'noHeroImage', 'displayImageDescription', 'model.type'),
      actions: {
        like() {
          this.sendAction(this.get('likeAction'));
        }
      }
    });

    registerComponent('voy-profile-update', { ComponentClass: VoyProfileUpdate });

    const VoySponsoredUpdate = Component.extend(genericMixin, {
      hasSponsoredText: bool('model.content.text'),
      hasImage: bool('model.content.image'),
      isShareArticle: equal('model.content.contentType', 'article'),
      isShareVideoImage: and('isShareVideo', 'hasImage'),
      isShareVideo: equal('model.content.contentType', 'video'),
      isShareArticleImage: and('isShareArticle', 'hasImage'),
      hasHeroEntity: or('hasImage', 'isShareVideoImage', 'isShareArticleImage'),
      displayContentBlock: or('hasSponsoredText', 'hasHeroEntity', 'noHeroImage', 'displayImageDescription'),
      displayImageDescription:computed(function() {
        return (this.get('isShareArticle') || this.get('isShareVideo')) && !this.get('noHeroImage');
      }),
      noHeroImage: computed('isShareArticle', 'isShareVideo', 'hasImage', function(){
        return ((this.get('isShareArticle') && !this.get('hasImage')) ||
                (this.get('isShareVideo') && !this.get('hasImage')));
      })
    });

    registerComponent('voy-sponsored-update', { ComponentClass: VoySponsoredUpdate });

    registerComponent('voy-viral-update', { ComponentClass: VoyViralUpdate });

    this.registerTopLevelTemplate(Templates['feed']);
  },

  start() {
    console.profile('render');
    this.render({ model: [dataGen(20)] });
    console.profileEnd('render');
    this.perf.mark('renderEnd');
    endTrace();
  }
});
